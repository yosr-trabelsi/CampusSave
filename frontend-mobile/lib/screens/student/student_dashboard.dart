import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/offers_provider.dart';
import '../../providers/orders_provider.dart';
import '../../utils/constants.dart';
import '../../utils/format.dart';
import '../../widgets/app_widgets.dart';
import 'home_screen.dart';
import 'my_orders_screen.dart';

/// Tableau de bord étudiant : mêmes indicateurs que frontend-web/src/pages/student/StudentDashboard.jsx.
class StudentDashboard extends StatelessWidget {
  const StudentDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    final orders = context.watch<OrdersProvider>();
    final offers = context.watch<OffersProvider>();
    final user = context.watch<AuthProvider>().user;

    Future<void> refresh() async {
      await Future.wait([orders.load(), offers.load()]);
    }

    final stats = [
      (Icons.shopping_bag_outlined, '${orders.valid.length}', 'Commandes', ''),
      (Icons.account_balance_wallet_outlined, formatPrice(orders.spent), 'Total dépensé', 'orange'),
      (Icons.savings_outlined, formatPrice(orders.savings(offers.originalPrices)), 'Économies réalisées', ''),
      (Icons.schedule, '${orders.activeCount}', 'En cours', 'red'),
    ];
    final points = user?.ecoPoints ?? orders.computedPoints;
    final impact = [
      (Icons.restaurant, '${orders.meals}', 'Repas sauvés', ''),
      (Icons.eco_outlined, '${orders.kgSaved.toStringAsFixed(1)} kg', 'Gaspillage évité', ''),
      (Icons.emoji_events_outlined, '$points', 'EcoPoints', 'orange'),
    ];
    final recent = orders.orders.take(5).toList();

    return SafeArea(
      bottom: false,
      child: RefreshIndicator(
        color: AppColors.primary,
        onRefresh: refresh,
        child: LayoutBuilder(builder: (context, c) {
          final pad = pagePadding(c.maxWidth);
          final wide = c.maxWidth >= 800;

          Widget grid(List<(IconData, String, String, String)> items, int cols, double ratio) => GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: cols,
                mainAxisSpacing: 14,
                crossAxisSpacing: 14,
                childAspectRatio: ratio,
                children: [for (final s in items) StatCard(icon: s.$1, value: s.$2, label: s.$3, tone: s.$4)],
              );

          Widget body;
          if (orders.loading && orders.orders.isEmpty && orders.error == null) {
            body = const Padding(
              padding: EdgeInsets.only(top: 60),
              child: Center(child: CircularProgressIndicator(color: AppColors.primary)),
            );
          } else if (orders.error != null && orders.orders.isEmpty) {
            body = ErrorCard(message: orders.error!, onRetry: refresh);
          } else {
            body = Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              grid(stats, wide ? 4 : 2, wide ? 1.5 : 1.05),
              const SizedBox(height: 24),
              const Text('Mon impact', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
              const SizedBox(height: 12),
              grid(impact, wide ? 3 : 2, wide ? 1.9 : 1.05),
              const SizedBox(height: 24),
              AppCard(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Dernières commandes', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 12),
                  if (recent.isEmpty) const Text('Aucune commande pour le moment.'),
                  for (final o in recent) ...[
                    const Divider(height: 1, color: AppColors.border),
                    Padding(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      child: Row(children: [
                        Expanded(
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text(o.offerTitle, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(fontWeight: FontWeight.w700)),
                            Text('Qté ${o.quantity} · ${formatPrice(o.totalPrice)}',
                                style: const TextStyle(color: AppColors.muted, fontSize: 13)),
                          ]),
                        ),
                        const SizedBox(width: 8),
                        StatusBadge(o),
                      ]),
                    ),
                  ],
                ]),
              ),
            ]);
          }

          return ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: pad,
            children: [PageHeader('Mon tableau de bord', subtitle: 'Bonjour ${user?.name ?? ''}'), body],
          );
        }),
      ),
    );
  }
}
