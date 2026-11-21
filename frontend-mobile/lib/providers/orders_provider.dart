import 'package:flutter/foundation.dart';
import '../models/order.dart';
import '../services/api_service.dart';
import '../services/order_service.dart';

/// Constantes du tableau de bord web (StudentDashboard.jsx)
const pointsPerPortion = 10;
const kgPerPortion = 0.4;

class OrdersProvider extends ChangeNotifier {
  List<Order> orders = [];
  bool loading = false;
  String? error;

  void reset() {
    orders = [];
    loading = false;
    error = null;
  }

  Future<void> load() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      final list = await OrderService.myOrders();
      list.sort((a, b) => (b.createdAt ?? DateTime(0)).compareTo(a.createdAt ?? DateTime(0)));
      orders = list;
    } on ApiException catch (e) {
      error = e.message;
    }
    loading = false;
    notifyListeners();
  }

  /// Crée la réservation (le backend décrémente le stock dans une transaction).
  Future<String> create(String offerId, int quantity) async {
    final id = await OrderService.create(offerId, quantity);
    load(); // rafraîchit la liste en arrière-plan
    return id;
  }

  // --- Statistiques : mêmes formules que le web ---
  List<Order> get valid => orders.where((o) => !o.isCancelled).toList();
  double get spent => valid.fold(0.0, (s, o) => s + o.totalPrice);
  int get activeCount => orders.where((o) => o.isActive).length;
  int get meals => orders.where((o) => o.isCollected).fold(0, (s, o) => s + o.quantity);
  double get kgSaved => meals * kgPerPortion;
  int get computedPoints => meals * pointsPerPortion;

  /// Économies = (prix d'origine - prix payé) x quantité, prix d'origine lu dans les offres.
  double savings(Map<String, double> originalPrices) => valid.fold(0.0, (s, o) {
        final orig = originalPrices[o.offerId] ?? o.unitPrice;
        final diff = (orig - o.unitPrice) * o.quantity;
        return s + (diff > 0 ? diff : 0);
      });
}
