import '../models/order.dart';
import 'api_service.dart';

class OrderService {
  /// POST /api/orders {offerId, quantity} -> {message, orderId}
  static Future<String> create(String offerId, int quantity) async {
    final r = await ApiService.post('/orders', {'offerId': offerId, 'quantity': quantity});
    final id = (r is Map ? r['orderId'] : null)?.toString();
    if (id == null || id.isEmpty) throw ApiException(500, 'Réservation créée mais identifiant manquant.');
    return id;
  }

  /// GET /api/orders/my-orders
  static Future<List<Order>> myOrders() async {
    final r = await ApiService.get('/orders/my-orders');
    if (r is! List) throw ApiException(500, 'Réponse inattendue du serveur (commandes).');
    return r.whereType<Map>().map((e) => Order.fromJson(Map<String, dynamic>.from(e))).toList();
  }

  /// GET /api/qr/:orderId -> {token, qrImage} (commande payée uniquement)
  static Future<String> qrToken(String orderId) async {
    final r = await ApiService.get('/qr/$orderId');
    final token = (r is Map ? r['token'] : null)?.toString();
    if (token == null || token.isEmpty) throw ApiException(500, 'QR Code indisponible.');
    return token;
  }
}
