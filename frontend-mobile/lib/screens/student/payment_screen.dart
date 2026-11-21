import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../providers/orders_provider.dart';
import '../../services/api_service.dart';
import '../../services/payment_service.dart';
import '../../utils/constants.dart';
import '../../widgets/app_widgets.dart';
import '../../widgets/custom_button.dart';
import 'order_qr_screen.dart';

/// Paiement Konnect : POST /payments/init -> payUrl ouvert dans le navigateur ;
/// pendant ce temps on interroge GET /payments/:orderId/status jusqu'à "paid".
class PaymentScreen extends StatefulWidget {
  final String orderId;
  final String title;
  final bool autoStart;
  const PaymentScreen({super.key, required this.orderId, this.title = 'Commande', this.autoStart = true});
  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> with WidgetsBindingObserver {
  String? _payUrl, _error;
  bool _starting = false, _paid = false;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    if (widget.autoStart) _start();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _timer?.cancel();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && !_paid) _check(); // retour du navigateur
  }

  Future<void> _start() async {
    setState(() {
      _starting = true;
      _error = null;
    });
    try {
      final init = await PaymentService.init(widget.orderId);
      _payUrl = init.payUrl;
      await _open();
      _timer?.cancel();
      _timer = Timer.periodic(const Duration(seconds: 3), (_) => _check());
    } on ApiException catch (e) {
      if (e.status == 409) {
        await _check(); // déjà payée
      } else {
        _error = e.message;
      }
    }
    if (mounted) setState(() => _starting = false);
  }

  Future<void> _open() async {
    final url = _payUrl;
    if (url == null) return;
    final ok = await launchUrl(Uri.parse(url), mode: LaunchMode.externalApplication);
    if (!ok && mounted) setState(() => _error = 'Impossible d’ouvrir la page de paiement.');
  }

  Future<void> _check() async {
    try {
      final s = await PaymentService.status(widget.orderId);
      if (s.isPaid && mounted) {
        _timer?.cancel();
        context.read<OrdersProvider>().load();
        setState(() => _paid = true);
      }
    } catch (_) {
      // nouvel essai au prochain tick
    }
  }

  @override
  Widget build(BuildContext context) {
    Widget content;
    if (_paid) {
      content = Column(mainAxisSize: MainAxisSize.min, children: [
        Container(
          width: 72,
          height: 72,
          decoration: const BoxDecoration(color: AppColors.primarySoft, shape: BoxShape.circle),
          child: const Icon(Icons.check, size: 40, color: AppColors.primary),
        ),
        const SizedBox(height: 16),
        const Text('Paiement confirmé', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
        const SizedBox(height: 8),
        const Text('Présentez votre QR code au commerçant pour récupérer votre commande.',
            textAlign: TextAlign.center, style: TextStyle(color: AppColors.muted)),
        const SizedBox(height: 24),
        PrimaryButton(
          label: 'Voir mon QR code',
          icon: Icons.qr_code_2,
          onPressed: () => Navigator.pushReplacement(context,
              MaterialPageRoute(builder: (_) => OrderQrScreen(orderId: widget.orderId, title: widget.title))),
        ),
      ]);
    } else if (_error != null) {
      content = Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Center(child: AppBadge(_error!, kind: BadgeKind.red)),
        const SizedBox(height: 20),
        PrimaryButton(label: 'Réessayer le paiement', onPressed: _start),
        const SizedBox(height: 12),
        const Text('Votre réservation est conservée dans « Mes commandes ».',
            textAlign: TextAlign.center, style: TextStyle(color: AppColors.muted)),
      ]);
    } else if (_starting || _payUrl == null) {
      content = Column(mainAxisSize: MainAxisSize.min, children: [
        const CircularProgressIndicator(color: AppColors.primary),
        const SizedBox(height: 16),
        const Text('Préparation du paiement…'),
        if (!widget.autoStart && !_starting) ...[
          const SizedBox(height: 16),
          PrimaryButton(label: 'Payer maintenant', onPressed: _start),
        ],
      ]);
    } else {
      content = Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        const Center(child: SizedBox(height: 40, width: 40, child: CircularProgressIndicator(strokeWidth: 3, color: AppColors.primary))),
        const SizedBox(height: 20),
        const Text('En attente du paiement',
            textAlign: TextAlign.center, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800)),
        const SizedBox(height: 8),
        const Text('Terminez le paiement dans le navigateur, puis revenez ici.',
            textAlign: TextAlign.center, style: TextStyle(color: AppColors.muted)),
        const SizedBox(height: 24),
        PrimaryButton(label: 'Rouvrir la page de paiement', icon: Icons.open_in_new, onPressed: _open),
        const SizedBox(height: 10),
        OutlinedButton(onPressed: _check, child: const Text('J’ai payé, vérifier')),
      ]);
    }

    return Scaffold(
      appBar: AppBar(title: Text('Paiement · ${widget.title}')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: AppCard(padding: const EdgeInsets.all(24), child: content),
          ),
        ),
      ),
    );
  }
}
