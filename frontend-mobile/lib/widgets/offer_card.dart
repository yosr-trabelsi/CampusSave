import 'package:flutter/material.dart';
import '../models/offer.dart';
import '../utils/constants.dart';
import '../utils/format.dart';
import 'app_widgets.dart';
import 'custom_button.dart';

class OfferImage extends StatelessWidget {
  final Offer offer;
  final double height;
  const OfferImage(this.offer, {super.key, this.height = 140});

  @override
  Widget build(BuildContext context) {
    final placeholder = Container(
      height: height,
      width: double.infinity,
      color: AppColors.primarySoft,
      child: const Icon(Icons.restaurant, size: 40, color: AppColors.primary),
    );
    final url = offer.imageUrl;
    if (url == null) return placeholder;
    return Image.network(url,
        height: height, width: double.infinity, fit: BoxFit.cover, errorBuilder: (_, __, ___) => placeholder);
  }
}

String pickupText(Offer o) =>
    (o.pickupStart != null && o.pickupEnd != null) ? 'Récupération : ${o.pickupStart}–${o.pickupEnd}' : '';

String expirationText(Offer o) {
  if (o.expirationRaw == null) return '';
  final d = o.expirationDate;
  final shown = d == null ? o.expirationRaw! : (o.expirationRaw!.length <= 10 ? formatDate(d) : formatDateTime(d));
  return 'À récupérer avant le $shown';
}

/// Carte d'offre : même contenu que la carte du web (Offers.jsx).
class OfferCard extends StatelessWidget {
  final Offer offer;
  final VoidCallback onTap;
  const OfferCard({super.key, required this.offer, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final o = offer;
    final soldOut = !(o.quantity > 0);
    return AppCard(
      padding: EdgeInsets.zero,
      onTap: onTap,
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        OfferImage(o),
        Padding(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
              AppBadge('-${o.discountPercent}%', kind: BadgeKind.orange),
              AppBadge(soldOut ? 'Épuisé' : '${o.quantity} restant(s)', kind: soldOut ? BadgeKind.red : BadgeKind.green),
            ]),
            const SizedBox(height: 12),
            Text(o.title, style: const TextStyle(fontSize: 17, fontWeight: FontWeight.w800)),
            const SizedBox(height: 6),
            InfoRow(Icons.storefront_outlined, '${o.businessName.isEmpty ? 'Commerce' : o.businessName} · ${categoryLabel(o.category)}'),
            Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
              Text(formatPrice(o.price),
                  style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: AppColors.primary)),
              const SizedBox(width: 8),
              Padding(
                padding: const EdgeInsets.only(bottom: 3),
                child: Text(formatPrice(o.originalPrice),
                    style: const TextStyle(color: AppColors.muted, decoration: TextDecoration.lineThrough)),
              ),
            ]),
            const SizedBox(height: 8),
            if (pickupText(o).isNotEmpty) InfoRow(Icons.schedule, pickupText(o)),
            if (expirationText(o).isNotEmpty) InfoRow(Icons.event_outlined, expirationText(o)),
            const SizedBox(height: 8),
            PrimaryButton(label: 'Réserver', onPressed: soldOut ? null : onTap),
          ]),
        ),
      ]),
    );
  }
}
