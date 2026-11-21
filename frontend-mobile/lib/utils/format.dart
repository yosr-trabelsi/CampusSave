import 'package:intl/intl.dart';

/// Même rendu que le web : "12.5 DT" (2 décimales pour les totaux).
String formatPrice(double v) {
  var s = v.toStringAsFixed(3);
  if (s.endsWith('0')) s = s.substring(0, s.length - 1);
  return '$s DT';
}

String formatDateTime(DateTime d) => DateFormat('dd/MM/yyyy HH:mm').format(d);
String formatDate(DateTime d) => DateFormat('dd/MM/yyyy').format(d);
