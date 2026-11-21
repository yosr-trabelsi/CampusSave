import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/offers_provider.dart';
import '../../providers/orders_provider.dart';
import '../../utils/constants.dart';
import '../../widgets/app_widgets.dart';
import '../../widgets/logout_button.dart';
import 'my_orders_screen.dart';
import 'offers_screen.dart';
import 'profile_screen.dart';
import 'student_dashboard.dart';

/// Structure + navigation. Mêmes entrées que la barre latérale du web (studentLinks dans App.jsx) :
/// Offres, Tableau de bord, Mes commandes, Mon profil.
/// Téléphone : barre de navigation en bas. Tablette / grand écran : barre latérale verte comme le web.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _index = 0;

  static const _items = [
    (Icons.search, Icons.search, 'Offres'),
    (Icons.dashboard_outlined, Icons.dashboard, 'Tableau de bord'),
    (Icons.assignment_outlined, Icons.assignment, 'Mes commandes'),
    (Icons.person_outline, Icons.person, 'Mon profil'),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<OffersProvider>().load();
      context.read<OrdersProvider>().load();
    });
  }

  void _select(int i) {
    setState(() => _index = i);
    if (i == 1 || i == 2) {
      context.read<OrdersProvider>().load();
      context.read<OffersProvider>().load(); // prix d'origine pour les économies
    }
  }

  @override
  Widget build(BuildContext context) {
    const pages = [OffersScreen(), StudentDashboard(), MyOrdersScreen(), ProfileScreen()];
    final body = IndexedStack(index: _index, children: pages);

    return LayoutBuilder(builder: (context, c) {
      if (c.maxWidth >= 800) {
        return Scaffold(
          body: Row(children: [
            _Sidebar(index: _index, onSelect: _select, items: _items),
            Expanded(child: Align(alignment: Alignment.topCenter, child: ConstrainedBox(constraints: const BoxConstraints(maxWidth: 1300), child: body))),
          ]),
        );
      }
      return Scaffold(
        body: body,
        bottomNavigationBar: NavigationBar(
          selectedIndex: _index,
          onDestinationSelected: _select,
          height: 68,
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          destinations: [
            for (final i in _items)
              NavigationDestination(
                icon: Icon(i.$1),
                selectedIcon: Icon(i.$2),
                label: i.$3 == 'Tableau de bord' ? 'Bord' : i.$3 == 'Mes commandes' ? 'Commandes' : i.$3 == 'Mon profil' ? 'Profil' : i.$3,
              ),
          ],
        ),
      );
    });
  }
}

/// .sidebar du web : dégradé deep -> deep-2, lien actif en pastille blanche.
class _Sidebar extends StatelessWidget {
  final int index;
  final ValueChanged<int> onSelect;
  final List<(IconData, IconData, String)> items;
  const _Sidebar({required this.index, required this.onSelect, required this.items});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 260,
      padding: const EdgeInsets.fromLTRB(18, 28, 18, 18),
      decoration: const BoxDecoration(
        gradient: LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [AppColors.deep, AppColors.deep2]),
      ),
      child: SafeArea(
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          const Padding(padding: EdgeInsets.fromLTRB(10, 0, 0, 24), child: BrandLogo(color: Colors.white)),
          for (var i = 0; i < items.length; i++)
            _NavTile(icon: items[i].$1, label: items[i].$3, selected: i == index, onTap: () => onSelect(i)),
          const Spacer(),
          _NavTile(
            icon: Icons.logout,
            label: 'Déconnexion',
            selected: false,
            onTap: () => confirmLogout(context),
          ),
        ]),
      ),
    );
  }
}

class _NavTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _NavTile({required this.icon, required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: selected ? Colors.white : Colors.transparent,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            child: Row(children: [
              Icon(icon, size: 19, color: selected ? AppColors.deep : Colors.white70),
              const SizedBox(width: 12),
              Text(label,
                  style: TextStyle(fontWeight: FontWeight.w600, color: selected ? AppColors.deep : Colors.white70)),
            ]),
          ),
        ),
      ),
    );
  }
}

/// Marge des pages : 16 sur téléphone, 44 sur grand écran (comme .main du web).
EdgeInsets pagePadding(double width) =>
    width >= 800 ? const EdgeInsets.fromLTRB(44, 36, 44, 36) : const EdgeInsets.fromLTRB(16, 20, 16, 24);
