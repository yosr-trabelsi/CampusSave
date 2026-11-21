import '../utils/constants.dart';
import '../utils/parsers.dart';

/// Collection "orders" (orderController / paymentController / qrController).
class Order {
  final String id, offerId, offerTitle, merchantId, status;
  final String businessName;
  final int quantity;
  final double unitPrice, totalPrice;
  final String? paymentStatus; // null | unpaid | pending | paid
  final DateTime? createdAt;

  const Order({
    required this.id,
    required this.offerId,
    required this.offerTitle,
    required this.merchantId,
    required this.status,
    required this.businessName,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
    this.paymentStatus,
    this.createdAt,
  });

  factory Order.fromJson(Map<String, dynamic> j) => Order(
        id: str(j['id']),
        offerId: str(j['offerId']),
        offerTitle: str(j['offerTitle']),
        merchantId: str(j['merchantId']),
        status: str(j['status']),
        businessName: str(j['businessName']),
        quantity: toInt(j['quantity']),
        unitPrice: toDouble(j['unitPrice']),
        totalPrice: toDouble(j['totalPrice']),
        paymentStatus: j['paymentStatus']?.toString(),
        createdAt: toDate(j['createdAt']),
      );

  bool get isPaid => paymentStatus == 'paid';
  bool get isCancelled => status == OrderStatus.cancelled;
  bool get isCollected => status == OrderStatus.collected || status == OrderStatus.completed;
  bool get isFinal => isCancelled || isCollected;
  bool get isActive => !isFinal;
  bool get needsPayment => !isPaid && !isFinal;
  bool get hasQr => isPaid && !isFinal;

  /// Libellés identiques au web (MyOrders.jsx)
  String get statusLabel {
    if (isCancelled) return 'Annulée';
    if (isCollected) return 'Récupérée';
    if (status == OrderStatus.ready) return 'Prête';
    if (status == OrderStatus.confirmed) return 'Confirmée';
    return 'En attente';
  }
}
