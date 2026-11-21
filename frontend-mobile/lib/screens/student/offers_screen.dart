import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/offers_provider.dart';
import '../../utils/constants.dart';
import '../../widgets/app_widgets.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/offer_card.dart';
import 'home_screen.dart';
import 'offer_details_screen.dart';

/// Consultation et recherche des offres (équivalent de pages/student/Offers.jsx).
class OffersScreen extends StatelessWidget {
  const OffersScreen({super.key});

  void _openFilters(BuildContext context) {
    final p = context.read<OffersProvider>();
    final top = p.highestPrice;
    var maxPrice = (p.maxPriceFilter ?? top).clamp(0, top).toDouble();
    var sort = p.sort;

    showModalBottomSheet(
      context: context,
      showDragHandle: true,
      backgroundColor: Colors.white,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setS) => Padding(
          padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(maxPrice >= top ? 'Prix max : aucune limite' : 'Prix max : ${maxPrice.round()} DT',
                style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
            Slider(
              value: maxPrice,
              min: 0,
              max: top,
              divisions: top.round().clamp(1, 100).toInt(),
              activeColor: AppColors.primary,
              onChanged: (v) => setS(() => maxPrice = v),
            ),
            const SizedBox(height: 8),
            const Text('Trier par', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
            const SizedBox(height: 8),
            Wrap(spacing: 8, runSpacing: 8, children: [
              for (final e in const {
                'recent': 'Récentes',
                'price_asc': 'Prix croissant',
                'price_desc': 'Prix décroissant',
                'discount': 'Plus grosse remise',
              }.entries)
                ChoiceChip(
                  label: Text(e.value),
                  selected: sort == e.key,
                  labelStyle: TextStyle(fontWeight: FontWeight.w600, color: sort == e.key ? Colors.white : AppColors.text),
                  onSelected: (_) => setS(() => sort = e.key),
                ),
            ]),
            const SizedBox(height: 20),
            Row(children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () {
                    p.applyFilters(maxPrice: null, sortBy: 'recent');
                    Navigator.pop(ctx);
                  },
                  child: const Text('Réinitialiser'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: PrimaryButton(
                  label: 'Appliquer',
                  onPressed: () {
                    p.applyFilters(maxPrice: maxPrice >= top ? null : maxPrice, sortBy: sort);
                    Navigator.pop(ctx);
                  },
                ),
              ),
            ]),
          ]),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final p = context.watch<OffersProvider>();
    final offers = p.visible;

    return SafeArea(
      bottom: false,
      child: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: p.load,
        child: LayoutBuilder(builder: (context, c) {
          final pad = pagePadding(c.maxWidth);
          final inner = c.maxWidth - pad.horizontal;
          // Responsive : 1 colonne sur téléphone, 2 à 4 sur tablette
          final cols = ((inner + 16) / (300 + 16)).floor().clamp(1, 4).toInt();
          final cardWidth = (inner - 16 * (cols - 1)) / cols;

          Widget content;
          if (p.loading && offers.isEmpty && p.error == null) {
            content = const Padding(
              padding: EdgeInsets.only(top: 60),
              child: Center(child: CircularProgressIndicator(color: AppColors.primary)),
            );
          } else if (p.error != null) {
            content = ErrorCard(message: p.error!, onRetry: p.load);
          } else if (offers.isEmpty) {
            content = const AppCard(child: Text('Aucune offre trouvée.'));
          } else {
            content = Wrap(
              spacing: 16,
              runSpacing: 16,
              children: [
                for (final o in offers)
                  SizedBox(
                    width: cardWidth,
                    child: OfferCard(
                      offer: o,
                      onTap: () => Navigator.push(
                          context, MaterialPageRoute(builder: (_) => OfferDetailsScreen(offer: o))),
                    ),
                  ),
              ],
            );
          }

          return ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: pad,
            children: [
              PageHeader('Offres du moment', subtitle: '${offers.length} offre(s) disponible(s)'),
              Row(children: [
                Expanded(
                  child: TextField(
                    onChanged: p.setQuery,
                    decoration: const InputDecoration(
                      hintText: 'Produit ou commerce...',
                      prefixIcon: Icon(Icons.search, color: AppColors.muted),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                SizedBox(
                  height: 50,
                  width: 50,
                  child: IconButton.filledTonal(
                    style: IconButton.styleFrom(
                      backgroundColor: AppColors.primarySoft,
                      foregroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () => _openFilters(context),
                    icon: Badge(isLabelVisible: p.hasFilters, backgroundColor: AppColors.accent, child: const Icon(Icons.tune)),
                  ),
                ),
              ]),
              const SizedBox(height: 12),
              SizedBox(
                height: 40,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    for (final cat in ['', ...offerCategories])
                      Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(cat.isEmpty ? 'Toutes catégories' : categoryLabel(cat)),
                          selected: p.category == cat,
                          labelStyle: TextStyle(
                              fontWeight: FontWeight.w600, color: p.category == cat ? Colors.white : AppColors.text),
                          onSelected: (_) => p.setCategory(cat),
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              content,
            ],
          );
        }),
      ),
    );
  }
}
