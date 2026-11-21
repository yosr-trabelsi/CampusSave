/// Mêmes règles que validationMiddleware.js (backend) et Profile.jsx (web).
class Validators {
  static String? email(String? v) {
    if (v == null || v.trim().isEmpty) return 'Email obligatoire';
    return RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(v.trim()) ? null : 'Email invalide';
  }

  /// Backend : 8 à 128 caractères à l'inscription.
  static String? newPassword(String? v) {
    if (v == null || v.isEmpty) return 'Mot de passe obligatoire';
    if (v.length < 8) return '8 caractères minimum';
    if (v.length > 128) return '128 caractères maximum';
    return null;
  }

  static String? name(String? v) {
    final s = v?.trim() ?? '';
    if (s.length < 2) return 'Le nom doit contenir au moins 2 caractères';
    if (s.length > 80) return 'Nom : 80 caractères maximum';
    return null;
  }

  /// Backend : /^\+?[0-9\s]{8,15}$/ (facultatif)
  static String? phone(String? v) {
    if (v == null || v.trim().isEmpty) return null;
    return RegExp(r'^\+?[0-9\s]{8,15}$').hasMatch(v.trim()) ? null : 'Numéro de téléphone invalide';
  }
}
