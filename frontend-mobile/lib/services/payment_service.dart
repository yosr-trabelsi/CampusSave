import 'api_service.dart';

class PaymentInit {
  final String payUrl, paymentRef;
  const PaymentInit(this.payUrl, this.paymentRef);
}

class PaymentState {
  final String paymentStatus; // unpaid | pending | paid
  final String? status; // statut de la commande
  const PaymentState(this.paymentStatus, this.status);
  bool get isPaid => paymentStatus == 'paid';
}

class PaymentService {
  /// POST /api/payments/init {orderId} -> {payUrl, paymentRef} (Konnect, mode sandbox)
  static Future<PaymentInit> init(String orderId) async {
    final r = await ApiService.post('/payments/init', {'orderId': orderId}) as Map;
    return PaymentInit(r['payUrl'].toString(), r['paymentRef'].toString());
  }

  /// GET /api/payments/:orderId/status (le backend se synchronise lui-même avec Konnect)
  static Future<PaymentState> status(String orderId) async {
    final r = await ApiService.get('/payments/$orderId/status') as Map;
    return PaymentState((r['paymentStatus'] ?? 'unpaid').toString(), r['status']?.toString());
  }
}
