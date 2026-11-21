import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/orders_provider.dart';
import '../../utils/constants.dart';
import '../../utils/validators.dart';
import '../../widgets/app_widgets.dart';
import '../../widgets/custom_button.dart';
import 'home_screen.dart';

/// Profil étudiant : même contenu que frontend-web/src/pages/Profile.jsx (carte d'identité + formulaire).
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final _form = GlobalKey<FormState>();
  late final TextEditingController _name;
  late final TextEditingController _phone;
  bool _busy = false;
  String? _msg;
  bool _ok = false;

  @override
  void initState() {
    super.initState();
    final u = context.read<AuthProvider>().user;
    _name = TextEditingController(text: u?.name ?? '');
    _phone = TextEditingController(text: u?.phone ?? '');
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_form.currentState!.validate()) return;
    setState(() {
      _busy = true;
      _msg = null;
    });
    final err = await context.read<AuthProvider>().updateProfile(name: _name.text, phone: _phone.text);
    if (!mounted) return;
    setState(() {
      _busy = false;
      _ok = err == null;
      _msg = err ?? 'Profil mis à jour';
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final orders = context.watch<OrdersProvider>();
    final u = auth.user;
    if (u == null) return const SizedBox();

    final points = u.ecoPoints ?? orders.computedPoints;
    final meals = (points / pointsPerPortion).round();
    final kg = (meals * kgPerPortion).toStringAsFixed(1);

    final identity = AppCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(
          width: 64,
          height: 64,
          alignment: Alignment.center,
          decoration: BoxDecoration(color: AppColors.primarySoft, borderRadius: BorderRadius.circular(12)),
          child: Text(u.name.isNotEmpty ? u.name[0].toUpperCase() : '?',
              style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: AppColors.primary)),
        ),
        const SizedBox(height: 14),
        Text(u.name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
        const SizedBox(height: 8),
        const Align(alignment: Alignment.centerLeft, child: AppBadge('Étudiant')),
        const SizedBox(height: 12),
        InfoRow(Icons.mail_outline, u.email),
        if ((u.phone ?? '').isNotEmpty) InfoRow(Icons.phone_outlined, u.phone!),
        const Divider(height: 28, color: AppColors.border),
        Row(children: [
          const Icon(Icons.emoji_events_outlined, size: 20),
          const SizedBox(width: 8),
          Text('$points', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
          const SizedBox(width: 6),
          const Text('EcoPoints', style: TextStyle(color: AppColors.muted)),
        ]),
        const SizedBox(height: 8),
        InfoRow(Icons.eco_outlined, '$meals repas sauvé(s) · $kg kg de gaspillage évité'),
      ]),
    );

    final form = AppCard(
      child: Form(
        key: _form,
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          const Text('Modifier mes informations', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
          const SizedBox(height: 16),
          TextFormField(
              controller: _name, decoration: const InputDecoration(labelText: 'Nom complet'), validator: Validators.name),
          const SizedBox(height: 14),
          TextFormField(
            initialValue: u.email,
            enabled: false,
            decoration: const InputDecoration(labelText: 'Email'),
          ),
          const SizedBox(height: 14),
          TextFormField(
              controller: _phone,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(labelText: 'Téléphone'),
              validator: Validators.phone),
          const SizedBox(height: 16),
          if (_msg != null)
            Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: Align(alignment: Alignment.centerLeft, child: AppBadge(_msg!, kind: _ok ? BadgeKind.green : BadgeKind.red)),
            ),
          PrimaryButton(label: 'Enregistrer', loading: _busy, onPressed: _save),
        ]),
      ),
    );

    return SafeArea(
      bottom: false,
      child: LayoutBuilder(builder: (context, c) {
        final pad = pagePadding(c.maxWidth);
        final wide = c.maxWidth >= 800;
        return ListView(
          padding: pad,
          children: [
            const PageHeader('Mon profil', subtitle: 'Informations de votre compte'),
            if (wide)
              Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Expanded(child: identity),
                const SizedBox(width: 20),
                Expanded(child: form),
              ])
            else ...[identity, const SizedBox(height: 16), form],
            if (!wide) ...[
              const SizedBox(height: 16),
              OutlinedButton.icon(
                onPressed: auth.logout,
                icon: const Icon(Icons.logout),
                label: const Text('Déconnexion'),
              ),
            ],
          ],
        );
      }),
    );
  }
}
