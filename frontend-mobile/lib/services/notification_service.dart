import 'package:firebase_messaging/firebase_messaging.dart';
import '../utils/constants.dart';
import 'api_service.dart';
import 'package:flutter/material.dart';

class NotificationService {
  static bool _listening = false;

  /// À appeler après connexion : permission + enregistrement du token FCM (POST /api/notifications/token).
  static Future<void> init() async {
    try {
      final fm = FirebaseMessaging.instance;
      await fm.requestPermission();
      final token = await fm.getToken();
      if (token != null) await _send(token);

      if (!_listening) {
        _listening = true;
        fm.onTokenRefresh.listen(_send);
        // Notification reçue application ouverte ("Paiement confirmé", "Commande récupérée")
        FirebaseMessaging.onMessage.listen((m) {
          final n = m.notification;
          if (n == null) return;
          rootMessengerKey.currentState?.showSnackBar(SnackBar(
            content: Text([n.title, n.body].whereType<String>().join('\n')),
            duration: const Duration(seconds: 5),
          ));
        });
      }
    } catch (_) {
      // Les notifications ne doivent jamais bloquer l'application
    }
  }

  static Future<void> _send(String token) async {
    try {
      await ApiService.post('/notifications/token', {'fcmToken': token});
    } catch (_) {}
  }
}
