import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../utils/constants.dart';

/// Demande confirmation puis déconnecte (Firebase signOut).
/// AuthGate ramène ensuite automatiquement l'utilisateur sur l'écran de connexion
/// et les providers d'offres / commandes sont vidés.
Future<void> confirmLogout(BuildContext context) async {
  final auth = context.read<AuthProvider>();
  final ok = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      title: const Text('Se déconnecter ?', style: TextStyle(fontWeight: FontWeight.w800)),
      content: const Text('Vous devrez vous reconnecter pour réserver des offres.'),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx, false),
          child: const Text('Annuler', style: TextStyle(color: AppColors.muted)),
        ),
        FilledButton(
          style: FilledButton.styleFrom(backgroundColor: AppColors.danger, minimumSize: const Size(0, 44)),
          onPressed: () => Navigator.pop(ctx, true),
          child: const Text('Déconnexion'),
        ),
      ],
    ),
  );
  if (ok == true) await auth.logout();
}

/// Bouton rond « déconnexion » affiché en haut à droite des pages (téléphone).
class LogoutButton extends StatelessWidget {
  const LogoutButton({super.key});

  @override
  Widget build(BuildContext context) {
    return IconButton(
      tooltip: 'Déconnexion',
      onPressed: () => confirmLogout(context),
      style: IconButton.styleFrom(
        backgroundColor: AppColors.dangerSoft,
        foregroundColor: AppColors.danger,
        minimumSize: const Size(44, 44),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      icon: const Icon(Icons.logout, size: 20),
    );
  }
}
