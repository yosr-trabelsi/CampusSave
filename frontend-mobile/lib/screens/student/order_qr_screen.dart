import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../providers/orders_provider.dart';
import '../../services/api_service.dart';
import '../../services/order_service.dart';
import '../../services/payment_service.dart';
import '../../utils/constants.dart';
import '../../widgets/app_widgets.dart';

/// QR code de la commande (GET /api/qr/:orderId), scanné par le commerçant (POST /api/qr/validate).
/// L'écran surveille le statut : dès que le commerçant valide, il passe en « Récupérée ».
class OrderQrScreen extends StatefulWidget {
  final String orderId;
  final String title;
  const OrderQrScreen({super.key, required this.orderId, this.title = 'Commande'});
  @override
  State<OrderQrScreen> createState() => _OrderQrScreenState();
}

class _OrderQrScreenState extends State<OrderQrScreen> {
  String? _token, _error;
  bool _loading = true, _collected = false;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _load();
    _timer = Timer.periodic(const Duration(seconds: 5), (_) => _watch());
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      _token = await OrderService.qrToken(widget.orderId);
    } on ApiException catch (e) {
      _error = e.status == 402 ? 'Cette commande n’est pas encore payée.' : e.message;
    }
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _watch() async {
    try {
      final s = await PaymentService.status(widget.orderId);
      if ((s.status == OrderStatus.collected || s.status == OrderStatus.completed) && mounted) {
        _timer?.cancel();
        context.read<OrdersProvider>().load();
        setState(() => _collected = true);
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    Widget content;
    if (_loading) {
      content = const Padding(padding: EdgeInsets.all(24), child: CircularProgressIndicator(color: AppColors.primary));
    } else if (_collected) {
      content = Column(mainAxisSize: MainAxisSize.min, children: [
        Container(
          width: 80,
          height: 80,
          decoration: const BoxDecoration(color: AppColors.primarySoft, shape: BoxShape.circle),
          child: const Icon(Icons.check, size: 44, color: AppColors.primary),
        ),
        const SizedBox(height: 16),
        const Text('Commande récupérée', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800)),
        const SizedBox(height: 8),
        const Text('Merci d’avoir sauvé de la nourriture !', style: TextStyle(color: AppColors.muted)),
      ]);
    } else if (_error != null || _token == null) {
      content = Column(mainAxisSize: MainAxisSize.min, children: [
        AppBadge(_error ?? 'QR Code indisponible.', kind: BadgeKind.red),
        const SizedBox(height: 16),
        FilledButton(
            style: FilledButton.styleFrom(minimumSize: const Size(0, 44)), onPressed: _load, child: const Text('Réessayer')),
      ]);
    } else {
      content = Column(mainAxisSize: MainAxisSize.min, children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
              color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.border)),
          child: QrImageView(data: _token!, version: QrVersions.auto, size: 230, backgroundColor: Colors.white),
        ),
        const SizedBox(height: 18),
        Text(widget.title, textAlign: TextAlign.center, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
        const SizedBox(height: 6),
        const Text('Présentez ce code au commerçant lors du retrait.',
            textAlign: TextAlign.center, style: TextStyle(color: AppColors.muted)),
        const SizedBox(height: 10),
        const AppBadge('Usage unique', kind: BadgeKind.orange),
      ]);
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Mon QR code')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 420),
            child: AppCard(padding: const EdgeInsets.all(24), child: Center(child: content)),
          ),
        ),
      ),
    );
  }
}
