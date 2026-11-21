import 'package:firebase_auth/firebase_auth.dart';
import '../models/user.dart';
import 'api_service.dart';

/// Connexion = Firebase Auth (SDK client), comme sur le web (AuthContext.jsx).
/// Inscription et profil = API backend (/auth/register, /auth/me).
class AuthService {
  static final _auth = FirebaseAuth.instance;

  static Stream<User?> get authChanges => _auth.authStateChanges();

  static Future<void> signIn(String email, String password) =>
      _auth.signInWithEmailAndPassword(email: email.trim(), password: password);

  /// POST /api/auth/register (public) : crée le compte Firebase + le profil Firestore.
  /// Même corps que le web (Register.jsx) avec role = student, puis on ouvre la session.
  static Future<void> register({
    required String name,
    required String email,
    required String password,
    String? phone,
  }) async {
    await ApiService.post(
      '/auth/register',
      {
        'name': name.trim(),
        'email': email.trim(),
        'password': password,
        'role': 'student',
        if (phone != null && phone.trim().isNotEmpty) 'phone': phone.trim(),
      },
      auth: false,
    );
    await signIn(email, password);
  }

  /// GET /api/auth/me
  static Future<AppUser> fetchProfile() async {
    final j = await ApiService.get('/auth/me');
    return AppUser.fromJson(Map<String, dynamic>.from(j as Map));
  }

  /// PUT /api/auth/me {name, phone}
  static Future<AppUser> updateProfile({required String name, required String phone}) async {
    final j = await ApiService.put('/auth/me', {'name': name.trim(), 'phone': phone.trim()});
    return AppUser.fromJson(Map<String, dynamic>.from(j as Map));
  }

  static Future<void> resetPassword(String email) => _auth.sendPasswordResetEmail(email: email.trim());

  static Future<void> signOut() => _auth.signOut();

  static String firebaseMessage(String code) {
    switch (code) {
      case 'invalid-email':
      case 'user-not-found':
      case 'wrong-password':
      case 'invalid-credential':
        return 'Email ou mot de passe incorrect';
      case 'user-disabled':
        return 'Ce compte est désactivé.';
      case 'network-request-failed':
        return 'Pas de connexion internet.';
      case 'too-many-requests':
        return 'Trop de tentatives. Réessayez plus tard.';
      default:
        return 'Erreur d’authentification ($code).';
    }
  }
}
