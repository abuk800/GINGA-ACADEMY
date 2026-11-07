/*
 * FREISTIL KIDS – zentrale Einstellungen
 * ---------------------------------------
 * Diese Datei wird im <head> jeder Seite synchron geladen (sehr klein),
 * damit z. B. die Weihnachtsaktion ohne Flackern ein- bzw. ausgeblendet wird.
 * Alle Werte hier anpassen – nicht im HTML.
 */
window.FSK_CONFIG = {
  /* Ende der Weihnachtsaktion (Banner + Weihnachts-Abschnitt verschwinden danach automatisch) */
  christmasEnd: '2026-12-24T23:59:59+01:00',

  /* Preis in Euro (Weihnachtsangebot) */
  price: 149,

  /*
   * Freie Plätze: NUR eintragen, wenn die Zahl echt und aktuell ist.
   * null = Anzeige ausgeblendet (keine falsche Knappheit).
   */
  freeSpots: null,

  /* true = Camp ausgebucht → Anmeldung wird automatisch zur Warteliste */
  bookedOut: false,

  /*
   * Formular-Endpunkte (z. B. eigenes Backend, Formspree, Make/Zapier-Webhook …).
   * null = Demo-Modus: Formulare funktionieren im Browser, senden aber nichts.
   * Erwartet: POST mit JSON-Body, Antwort 2xx (optional JSON { reference, paymentUrl }).
   */
  endpoints: {
    anmeldung: null,
    anmeldungDetails: null,
    gutschein: null
  },

  /*
   * Zahlungsanbieter – noch offen.
   * Sobald entschieden: provider setzen und in main.js die Funktion
   * FSK.startPayment() anbinden (Stripe Checkout, PayPal, Mollie …).
   * Liefert der Endpunkt eine paymentUrl zurück, wird automatisch dorthin weitergeleitet.
   */
  payment: {
    provider: null
  },

  /*
   * Optionale Dienste, die eine Einwilligung brauchen (z. B. Statistik).
   * Leer = es wird nur ein Info-Hinweis gezeigt, keine Einwilligung abgefragt.
   * Beispiel: [{ id: 'statistik', name: 'Statistik (z. B. Plausible/Matomo)' }]
   */
  optionalServices: []
};

/* Sofort ausführen: Status-Klassen auf <html> setzen (verhindert Flackern) */
(function () {
  var c = window.FSK_CONFIG;
  var root = document.documentElement;
  root.classList.add('js');
  if (Date.now() > Date.parse(c.christmasEnd)) root.classList.add('xmas-over');
  if (c.bookedOut) root.classList.add('booked-out');
})();
