/* AMMCO Grease & Septic: shared behaviour for every page.
   SETTINGS: fill these in once and every page updates.
   phone         digits only, e.g. '4095551234'. Leave '' until the number is confirmed.
   dispatchEmail the inbox service requests should go to. Leave '' until confirmed. */
var SITE = { phone: '', dispatchEmail: '' };

(function(){
  // Phone: click-to-call everywhere once SITE.phone is set.
  var d = (SITE.phone || '').replace(/\D/g,'');
  if (d.length === 10) {
    var shown = '(' + d.slice(0,3) + ') ' + d.slice(3,6) + '-' + d.slice(6);
    document.querySelectorAll('[data-phone]').forEach(function(a){
      a.href = 'tel:+1' + d;
      var t = a.querySelector('[data-phone-text]') || a;
      t.textContent = shown;
      a.setAttribute('aria-label','Call ' + shown);
      a.hidden = false;
    });
    document.querySelectorAll('[data-phone-pending]').forEach(function(e){ e.hidden = true; });
  }
  if (SITE.dispatchEmail) {
    document.querySelectorAll('[data-email]').forEach(function(a){ a.href = 'mailto:' + SITE.dispatchEmail; a.textContent = SITE.dispatchEmail; a.hidden = false; });
    document.querySelectorAll('[data-email-pending]').forEach(function(e){ e.hidden = true; });
  }

  // Mobile menu
  var tog = document.getElementById('navToggle'), links = document.getElementById('navLinks');
  if (tog && links) {
    tog.addEventListener('click', function(){
      var open = links.classList.toggle('open'); tog.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function(e){ if (e.target.tagName === 'A') { links.classList.remove('open'); tog.setAttribute('aria-expanded','false'); } });
  }

  // Photos: any element with data-photo="assets/img/name.jpg" shows that photo as soon as the file exists.
  // Until then the designed panel stays. To add a photo, drop the file in assets/img with that name.
  document.querySelectorAll('[data-photo]').forEach(function(el){
    var img = new Image();
    img.onload = function(){
      img.alt = el.getAttribute('data-alt') || '';
      el.appendChild(img);
      var host = el.closest('.hero'); if (host) host.classList.add('has-photo');
    };
    img.src = el.getAttribute('data-photo');
  });

  // Customer strip: duplicate the list so the scroll loops without a gap.
  document.querySelectorAll('.marquee-track').forEach(function(track){
    var g = track.querySelector('.marquee-group'); if (!g) return;
    var c = g.cloneNode(true); c.setAttribute('aria-hidden','true'); track.appendChild(c);
  });

  // Request form
  var form = document.getElementById('reqForm');
  if (form) {
    var pick = new URLSearchParams(location.search).get('service');
    if (pick) { Array.prototype.forEach.call(form.elements.service.options, function(o){ if (o.value.toLowerCase().indexOf(pick.toLowerCase()) > -1) form.elements.service.value = o.value; }); }
    var sent = document.getElementById('sent'), sentText = document.getElementById('sentText');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var missing = ['name','business','phone'].filter(function(n){ return !form.elements[n].value.trim(); });
      if (missing.length) { form.elements[missing[0]].focus(); form.elements[missing[0]].style.borderColor = '#C8731A'; return; }
      var v = function(n){ return form.elements[n].value.trim(); };
      var body = 'Service request, AMMCO Grease & Septic\n' +
        'Name: ' + v('name') + '\nBusiness: ' + v('business') + '\nPhone: ' + v('phone') + '\nEmail: ' + (v('email') || '-') +
        '\nService: ' + v('service') + '\nSite: ' + (v('site') || '-') + '\nDetails: ' + (v('message') || '-');
      if (SITE.dispatchEmail) {
        location.href = 'mailto:' + SITE.dispatchEmail + '?subject=' + encodeURIComponent('Service request: ' + v('business')) + '&body=' + encodeURIComponent(body);
        return;
      }
      sentText.textContent = body; sent.hidden = false; sent.scrollIntoView({block:'nearest'});
    });
    form.addEventListener('input', function(e){ if (e.target.style) e.target.style.borderColor = ''; });
    var copyBtn = document.getElementById('copyReq');
    if (copyBtn) copyBtn.addEventListener('click', function(){
      var m = document.getElementById('copyMsg'), txt = sentText.textContent;
      function done(ok){ m.textContent = ok ? 'Copied.' : 'Select the text above to copy.'; }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function(){done(true);}, function(){done(false);});
      else done(false);
    });
  }
})();
