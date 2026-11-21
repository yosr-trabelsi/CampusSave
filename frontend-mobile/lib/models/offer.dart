import '../utils/parsers.dart';

/// Collection "offers" (offerController + champs utilisés par le web) :
/// merchantId, businessName, title, description, price (prix réduit), originalPrice, quantity,
/// expirationDate, isAvailable, createdAt + category, imageUrl, pickupStart, pickupEnd (formulaire web).
class Offer {
  final String id, merchantId, title, description, businessName, category;
  final double price, originalPrice;
  final int quantity;
  final bool isAvailable;
  final DateTime? expirationDate, createdAt;
  final String? expirationRaw, imageUrl, pickupStart, pickupEnd;

  const Offer({
    required this.id,
    required this.merchantId,
    required this.title,
    required this.description,
    required this.businessName,
    required this.category,
    required this.price,
    required this.originalPrice,
    required this.quantity,
    required this.isAvailable,
    this.expirationDate,
    this.expirationRaw,
    this.createdAt,
    this.imageUrl,
    this.pickupStart,
    this.pickupEnd,
  });

  static String? _opt(dynamic v) {
    final s = str(v).trim();
    return s.isEmpty ? null : s;
  }

  factory Offer.fromJson(Map<String, dynamic> j) {
    final cat = norm(str(j['category']).trim());
    return Offer(
      id: str(j['id']),
      merchantId: str(j['merchantId']),
      title: str(j['title']),
      description: str(j['description']),
      businessName: str(j['businessName']),
      category: cat.isEmpty ? 'autre' : cat,
      price: toDouble(j['price']),
      originalPrice: toDouble(j['originalPrice']),
      quantity: toInt(j['quantity']),
      isAvailable: j['isAvailable'] != false,
      expirationDate: toDate(j['expirationDate'], endOfDay: true),
      expirationRaw: _opt(j['expirationDate']),
      createdAt: toDate(j['createdAt']),
      imageUrl: _opt(j['imageUrl']),
      pickupStart: _opt(j['pickupStart']),
      pickupEnd: _opt(j['pickupEnd']),
    );
  }

  /// Même calcul que le web : round((1 - price/originalPrice) * 100)
  int get discountPercent =>
      originalPrice <= 0 ? 0 : ((1 - price / originalPrice) * 100).round().clamp(0, 100).toInt();

  bool get isExpired => expirationDate != null && expirationDate!.isBefore(DateTime.now());
  bool get isBookable => isAvailable && quantity > 0 && !isExpired;
}
