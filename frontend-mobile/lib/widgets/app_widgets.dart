import 'package:flutter/material.dart';
import '../utils/constants.dart';

/// Équivalent de la classe CSS .card du web : fond blanc, bordure #e6e5da, rayon 18, ombre douce.
class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  const AppCard({super.key, required this.child, this.padding = const EdgeInsets.all(18), this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
        boxShadow: [BoxShadow(color: AppColors.deep.withOpacity(.07), blurRadius: 30, offset: const Offset(0, 8))],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(18),
        clipBehavior: Clip.antiAlias,
        child: InkWell(onTap: onTap, child: Padding(padding: padding, child: child)),
      ),
    );
  }
}

enum BadgeKind { green, orange, red, accent }

/// Équivalent de .badge .badge-green / -orange / -red du web.
class AppBadge extends StatelessWidget {
  final String text;
  final BadgeKind kind;
  const AppBadge(this.text, {super.key, this.kind = BadgeKind.green});

  @override
  Widget build(BuildContext context) {
    late Color bg, fg;
    switch (kind) {
      case BadgeKind.green:
        bg = AppColors.primarySoft;
        fg = AppColors.primary;
        break;
      case BadgeKind.orange:
        bg = AppColors.warningSoft;
        fg = AppColors.warning;
        break;
      case BadgeKind.red:
        bg = AppColors.dangerSoft;
        fg = AppColors.danger;
        break;
      case BadgeKind.accent:
        bg = AppColors.accentSoft;
        fg = AppColors.accent;
        break;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(999)),
      child: Text(text, style: TextStyle(color: fg, fontWeight: FontWeight.w700, fontSize: 12)),
    );
  }
}

/// .page-header du web : titre 1.9rem / 800 + sous-titre grisé.
class PageHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget? trailing;
  const PageHeader(this.title, {super.key, this.subtitle, this.trailing});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
            if (subtitle != null)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(subtitle!, style: const TextStyle(color: AppColors.muted)),
              ),
          ]),
        ),
        if (trailing != null) trailing!,
      ]),
    );
  }
}

/// .stat-card du web : icône colorée, grande valeur, libellé.
class StatCard extends StatelessWidget {
  final IconData icon;
  final String value, label;
  final String tone; // '' | orange | red
  const StatCard({super.key, required this.icon, required this.value, required this.label, this.tone = ''});

  @override
  Widget build(BuildContext context) {
    final bg = tone == 'orange'
        ? AppColors.accentSoft
        : tone == 'red'
            ? AppColors.dangerSoft
            : AppColors.primarySoft;
    final fg = tone == 'orange'
        ? AppColors.accent
        : tone == 'red'
            ? AppColors.danger
            : AppColors.primary;
    return AppCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Container(
          width: 46,
          height: 46,
          decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(14)),
          child: Icon(icon, color: fg, size: 22),
        ),
        Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(value, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800, letterSpacing: -1)),
          ),
          Text(label, style: const TextStyle(color: AppColors.muted, fontWeight: FontWeight.w500, fontSize: 13)),
        ]),
      ]),
    );
  }
}

/// Logo : carré orange arrondi + feuille + "CampusSave" (.brand / .brand-dot du web).
class BrandLogo extends StatelessWidget {
  final Color color;
  const BrandLogo({super.key, this.color = AppColors.deep});

  @override
  Widget build(BuildContext context) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(color: AppColors.accent, borderRadius: BorderRadius.circular(12)),
        child: const Icon(Icons.eco_outlined, color: Colors.white, size: 20),
      ),
      const SizedBox(width: 10),
      Text('CampusSave', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: color)),
    ]);
  }
}

/// Bloc d'erreur "Impossible de joindre le serveur" + bouton Réessayer (comme les pages du web).
class ErrorCard extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const ErrorCard({super.key, required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return AppCard(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        AppBadge(message, kind: BadgeKind.red),
        const SizedBox(height: 12),
        FilledButton(
          style: FilledButton.styleFrom(minimumSize: const Size(0, 44)),
          onPressed: onRetry,
          child: const Text('Réessayer'),
        ),
      ]),
    );
  }
}

class InfoRow extends StatelessWidget {
  final IconData icon;
  final String text;
  const InfoRow(this.icon, this.text, {super.key});

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Row(children: [
          Icon(icon, size: 16, color: AppColors.muted),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: const TextStyle(color: AppColors.muted, fontWeight: FontWeight.w500))),
        ]),
      );
}
