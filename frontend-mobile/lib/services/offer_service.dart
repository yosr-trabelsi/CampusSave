import '../models/offer.dart';
import 'api_service.dart';

class OfferService {
  /// GET /api/offers : offres disponibles (isAvailable == true), tableau JSON brut.
  static Future<List<Offer>> fetchOffers() async {
    final raw = await ApiService.get('/offers');
    if (raw is! List) throw ApiException(500, 'Réponse inattendue du serveur (offres).');
    return raw.whereType<Map>().map((e) => Offer.fromJson(Map<String, dynamic>.from(e))).toList();
  }
}
