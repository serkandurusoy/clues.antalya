trim = function(text) {
  return text.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
};

formatPhone = function(phone) {
  phone = [phone.slice(0, 3), ' (', phone.slice(3)].join('');
  phone = [phone.slice(0, 8), ') ', phone.slice(8)].join('');
  phone = [phone.slice(0, 13), ' ', phone.slice(13)].join('');
  return phone;
};


testEmail = function(eposta) {
  return /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+(?:[A-Z]{2}|com|org|net|gov|biz|info|io|aero|edu|de|co\.uk|com\.tr|org\.tr|k12\.tr|bel\.tr|gov\.tr|av\.tr|net\.tr|gen\.tr|edu\.tr|web\.tr)\b$/.test(eposta)
};

testTel = function(tel) {
  return /^[0-9]{10}$/.test(tel) && _.contains(['501','505','506','530','531','532','533','534','535','536','537','538','539','540','541','542','543','544','545','546','547','548','549','551','552','553','554','555','556','559'], tel.substring(0,3))
};

testIp = function(ip) {
  return /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip);
};

bilgiDuzenle = function(bilgiler) {
  bilgiler.isim = s.titleize(trim(bilgiler.isim));

  bilgiler.not = trim(bilgiler.not)+'';
  bilgiler.not = bilgiler.not.length > 0 ? bilgiler.not : 'Herhangi bir not bırakılmadı.';

  bilgiler.telefon = '+90' + bilgiler.telefon.toString();
};

kayitAra = function(tarih, saat, durum) {
  var rez = Rezervasyon.findOne({
    tarih: tarih,
    saat: saat,
    durum: durum
  });
  return rez;
};
