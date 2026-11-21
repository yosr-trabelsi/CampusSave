import 'package:flutter/material.dart';

class AppConfig {
  /// Émulateur Android : 10.0.2.2 = localhost du PC.
  /// Téléphone réel : --dart-define=API_URL=http://IP_DU_PC:5000/api
  static const apiUrl =
      String.fromEnvironment('API_URL', defaultValue: 'http://10.0.2.2:5000/api');
}

/// Palette reprise de frontend-web/src/index.css (variables CSS :root)
class AppColors {
  static const bg = Color(0xFFF4F3EC);
  static const surface = Colors.white;
  static const text = Color(0xFF14221B);
  static const muted = Color(0xFF6B7A72);
  static const border = Color(0xFFE6E5DA);
  static const primary = Color(0xFF1F9D63);
  static const primarySoft = Color(0xFFE4F5EC);
  static const deep = Color(0xFF0C3B2A);
  static const deep2 = Color(0xFF0F5139);
  static const accent = Color(0xFFFF7A3D);
  static const accentSoft = Color(0xFFFFF0E8);
  static const danger = Color(0xFFE5484D);
  static const dangerSoft = Color(0xFFFDECEC);
  static const warning = Color(0xFFB7791F);
  static const warningSoft = Color(0xFFFFF6DD);
}

/// Statuts de commande (orderController / qrController / paymentController).
/// Le web utilise "completed", le backend écrit "collected" au scan du QR : on gère les deux.
class OrderStatus {
  static const pending = 'pending';
  static const confirmed = 'confirmed';
  static const ready = 'ready';
  static const collected = 'collected';
  static const completed = 'completed';
  static const cancelled = 'cancelled';
}

/// Mêmes catégories que le web (Offers.jsx / MyOffers.jsx).
const offerCategories = ['boulangerie', 'restaurant', 'cafeteria', 'epicerie', 'patisserie', 'autre'];

String categoryLabel(String c) {
  switch (c) {
    case 'boulangerie':
      return 'Boulangerie';
    case 'restaurant':
      return 'Restaurant';
    case 'cafeteria':
      return 'Cafétéria';
    case 'epicerie':
      return 'Épicerie';
    case 'patisserie':
      return 'Pâtisserie';
    default:
      return 'Autre';
  }
}

/// Permet d'afficher un SnackBar (ex: notification FCM) depuis n'importe où.
final rootMessengerKey = GlobalKey<ScaffoldMessengerState>();
