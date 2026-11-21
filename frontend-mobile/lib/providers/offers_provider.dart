import 'package:flutter/foundation.dart';
import '../models/offer.dart';
import '../services/api_service.dart';
import '../services/offer_service.dart';
import '../utils/parsers.dart';

/// Comme le web (Offers.jsx) : on charge GET /api/offers puis on recherche / filtre / trie localement.
class OffersProvider extends ChangeNotifier {
  List<Offer> _all = [];
  bool loading = false;
  String? error;

  String query = '';
  String category = ''; // '' = toutes
  double? maxPriceFilter; // "Prix max" du web
  String sort = 'recent'; // recent | price_asc | price_desc | discount

  void reset() {
    _all = [];
    loading = false;
    error = null;
    query = '';
    category = '';
    maxPriceFilter = null;
    sort = 'recent';
  }

  /// Prix d'origine par offre (sert aux « économies réalisées » du tableau de bord, comme le web)
  Map<String, double> get originalPrices => {for (final o in _all) o.id: o.originalPrice};

  double get highestPrice {
    if (_all.isEmpty) return 30;
    final m = _all.map((o) => o.price).reduce((a, b) => a > b ? a : b);
    return m < 1 ? 1 : m.ceilToDouble();
  }

  bool get hasFilters => maxPriceFilter != null || sort != 'recent';

  List<Offer> get visible {
    final q = norm(query.trim());
    final list = _all.where((o) {
      if (!o.isBookable) return false;
      if (category.isNotEmpty && o.category != category) return false;
      if (maxPriceFilter != null && o.price > maxPriceFilter!) return false;
      if (q.isNotEmpty) {
        final hay = norm('${o.title} ${o.businessName} ${o.category} ${o.description}');
        if (!hay.contains(q)) return false;
      }
      return true;
    }).toList();

    switch (sort) {
      case 'price_asc':
        list.sort((a, b) => a.price.compareTo(b.price));
        break;
      case 'price_desc':
        list.sort((a, b) => b.price.compareTo(a.price));
        break;
      case 'discount':
        list.sort((a, b) => b.discountPercent.compareTo(a.discountPercent));
        break;
      default:
        list.sort((a, b) => (b.createdAt ?? DateTime(0)).compareTo(a.createdAt ?? DateTime(0)));
    }
    return list;
  }

  void setQuery(String v) {
    query = v;
    notifyListeners();
  }

  void setCategory(String c) {
    category = c;
    notifyListeners();
  }

  void applyFilters({double? maxPrice, required String sortBy}) {
    maxPriceFilter = maxPrice;
    sort = sortBy;
    notifyListeners();
  }

  Future<void> load() async {
    loading = true;
    error = null;
    notifyListeners();
    try {
      _all = await OfferService.fetchOffers();
    } on ApiException catch (e) {
      error = e.message;
    }
    loading = false;
    notifyListeners();
  }
}
