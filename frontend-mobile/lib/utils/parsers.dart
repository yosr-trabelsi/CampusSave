/// Le backend renvoie parfois des nombres/dates sous des formes variées : on est tolérant.
String str(dynamic v) => v == null ? '' : v.toString();

double toDouble(dynamic v) {
  if (v is num) return v.toDouble();
  return double.tryParse(str(v).replaceAll(',', '.')) ?? 0;
}

int toInt(dynamic v) {
  if (v is num) return v.toInt();
  return int.tryParse(str(v)) ?? 0;
}

/// Accepte ISO 8601, date seule (YYYY-MM-DD) et Timestamp Firestore sérialisé ({_seconds}).
/// [endOfDay] : une date sans heure vaut jusqu'à 23:59 (ex: date d'expiration d'une offre).
DateTime? toDate(dynamic v, {bool endOfDay = false}) {
  if (v == null) return null;
  if (v is Map) {
    final s = v['_seconds'] ?? v['seconds'];
    return s is num ? DateTime.fromMillisecondsSinceEpoch(s.toInt() * 1000) : null;
  }
  final s = v.toString().trim();
  if (s.isEmpty) return null;
  final d = DateTime.tryParse(s);
  if (d == null) return null;
  if (endOfDay && s.length <= 10) return DateTime(d.year, d.month, d.day, 23, 59, 59);
  return d.toLocal();
}

/// Minuscules + suppression des accents (recherche tolérante).
String norm(String s) {
  const from = 'àâäáãçéèêëíìîïñóòôöõúùûüýÿœ';
  const to = 'aaaaaceeeeiiiinooooouuuuyyo';
  final b = StringBuffer();
  for (final ch in s.toLowerCase().split('')) {
    final i = from.indexOf(ch);
    b.write(i >= 0 ? to[i] : ch);
  }
  return b.toString();
}
