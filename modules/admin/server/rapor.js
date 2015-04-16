temporaryFiles.allow({
  insert: function (userId, file) {
    return !!userId;
  },
  remove: function (userId, file) {
    return !!userId;
  },
  read: function (userId, file) {
    return true;
  },
  write: function (userId, file, fields) {
    return !!userId;
  }
});

temporaryFiles.deny({
  insert: function (userId, file) {
    return !userId;
  },
  remove: function (userId, file) {
    return !userId;
  },
  read: function (userId, file) {
    return false;
  },
  write: function (userId, file, fields) {
    return !userId;
  }
});

Meteor.methods({
  'downloadExcelFileMus' : function() {
    var Future = Npm.require('fibers/future');
    var futureResponse = new Future();

    var excel = new Excel('xlsx');
    var workbook = excel.createWorkbook();
    var worksheet = excel.createWorksheet();
    worksheet.writeToCell(0,0, 'Ad ve Soyad');
    worksheet.writeToCell(0,1, 'Cep Telefonu');
    worksheet.writeToCell(0,2, 'E-posta Adresi');
    worksheet.writeToCell(0,3, 'Rezervasyon Sayısı');
    worksheet.writeToCell(0,4, 'Kişi Sayısı');
    worksheet.writeToCell(0,5, 'Toplam TL Ciro');
    worksheet.writeToCell(0,6, 'Son Rezervasyonu');
    worksheet.writeToCell(0,7, 'Müşteri Özel Notu');
    worksheet.writeToCell(0,8, 'Son Güncelleme Zamanı');
    worksheet.writeToCell(0,9, 'Güncelleme Sayısı');

    var row = 1;
    Musteriler.find({},{sort: {isim: 1}}).forEach(function(musteri) {
      worksheet.writeToCell(row, 0, musteri.isim);
      worksheet.writeToCell(row, 1, formatPhone(musteri.telefon));
      worksheet.writeToCell(row, 2, musteri.eposta);
      worksheet.writeToCell(row, 3, musteri.rez);
      worksheet.writeToCell(row, 4, musteri.kisi);
      worksheet.writeToCell(row, 5, musteri.ciro);
      worksheet.writeToCell(row, 6, musteri.rez > 0 ? musteri.sonRezervasyonu().tarih : 'Rezervasyonu yok');
      worksheet.writeToCell(row, 7, musteri.not);
      worksheet.writeToCell(row, 8, moment.tz(moment(musteri.lastModified).format('YYYY-MM-DD HH:mm:ss'), 'YYYY-MM-DD HH:mm:ss', 'UTC').toDate());
      worksheet.writeToCell(row, 9, musteri.revisions ? musteri.revisions.length : 'Yok');

      row++;
    });

    workbook.addSheet('musteriler', worksheet);

    mkdirp('tmpmus', Meteor.bindEnvironment(function (err) {
      if (err) {
        console.log('Musteriler xlsx dosyasi icin tmp dir yaratirken sorun olustu.', err);
        futureResponse.throw(err);
      }
      else {
        var uuid = UUID.v4();
        var filePath = './tmpmus/' + uuid;
        workbook.writeToFile(filePath);

        temporaryFiles.importFile(filePath, {
          filename : uuid,
          contentType: 'application/octet-stream'
        }, function(err, file) {
          if (err) {
            futureResponse.throw(err);
          }
          else {
            futureResponse.return('/gridfs/temporaryFiles/' + file._id);
          }
        });
      }
    }));

    return futureResponse.wait();
  },
  'downloadExcelFileRez' : function() {
    var Future = Npm.require('fibers/future');
    var futureResponse = new Future();

    var excel = new Excel('xlsx');
    var workbook = excel.createWorkbook();
    var worksheet = excel.createWorksheet();
    worksheet.writeToCell(0,0, 'Tarih');
    worksheet.writeToCell(0,1, 'Saat');
    worksheet.writeToCell(0,2, 'Kanal');
    worksheet.writeToCell(0,3, 'Tip');
    worksheet.writeToCell(0,4, 'TL Fiyat');
    worksheet.writeToCell(0,5, 'Kişi Sayısı');
    worksheet.writeToCell(0,6, 'Kayıt Zamanı');
    worksheet.writeToCell(0,7, 'Bağlantı ID');
    worksheet.writeToCell(0,8, 'IP Adresi');
    worksheet.writeToCell(0,9, 'Son Güncelleme Zamanı');
    worksheet.writeToCell(0,10, 'Güncelleme Sayısı');
    worksheet.writeToCell(0,11, 'Ad ve Soyad');
    worksheet.writeToCell(0,12, 'Cep Telefonu');
    worksheet.writeToCell(0,13, 'E-posta Adresi');
    worksheet.writeToCell(0,14, 'Rezervasyon Notu');
    worksheet.writeToCell(0,15, 'Müşteri Rezervasyon Sayısı');
    worksheet.writeToCell(0,16, 'Müşteri Toplam Kişi Sayısı');
    worksheet.writeToCell(0,17, 'Müşteri Toplam TL Ciro');
    worksheet.writeToCell(0,18, 'Müşteri Son Rezervasyonu');
    worksheet.writeToCell(0,19, 'Müşteri Özel Notu');
    worksheet.writeToCell(0,20, 'Müşteri Son Güncelleme Zamanı');
    worksheet.writeToCell(0,21, 'Müşteri Güncelleme Sayısı');

    var row = 1;
    Rezervasyon.find({durum:'dolu'},{sort: {tarih: 1, saat: 1}}).forEach(function(rezervasyon) {
      worksheet.writeToCell(row, 0, rezervasyon.tarih );
      worksheet.writeToCell(row, 1, rezervasyon.saat );
      worksheet.writeToCell(row, 2, rezervasyon.kanal );
      worksheet.writeToCell(row, 3, rezervasyon.tip );
      worksheet.writeToCell(row, 4, rezervasyon.fiyat );
      worksheet.writeToCell(row, 5, rezervasyon.bilgiler.sayi );
      worksheet.writeToCell(row, 6, moment.tz(moment(rezervasyon.zaman).format('YYYY-MM-DD HH:mm:ss'), 'YYYY-MM-DD HH:mm:ss', 'UTC').toDate() );
      worksheet.writeToCell(row, 7, rezervasyon.conn );
      worksheet.writeToCell(row, 8, rezervasyon.ip );
      worksheet.writeToCell(row, 9, moment.tz(moment(rezervasyon.lastModified).format('YYYY-MM-DD HH:mm:ss'), 'YYYY-MM-DD HH:mm:ss', 'UTC').toDate() );
      worksheet.writeToCell(row, 10, rezervasyon.revisions ? rezervasyon.revisions.length : 'Yok' );
      worksheet.writeToCell(row, 11, rezervasyon.bilgiler.isim );
      worksheet.writeToCell(row, 12, formatPhone(rezervasyon.bilgiler.telefon) );
      worksheet.writeToCell(row, 13, rezervasyon.bilgiler.eposta );
      worksheet.writeToCell(row, 14, rezervasyon.bilgiler.not );
      worksheet.writeToCell(row, 15, rezervasyon.musterisi().rez );
      worksheet.writeToCell(row, 16, rezervasyon.musterisi().kisi );
      worksheet.writeToCell(row, 17, rezervasyon.musterisi().ciro );
      worksheet.writeToCell(row, 18, rezervasyon.musterisi().sonRezervasyonu().tarih );
      worksheet.writeToCell(row, 19, rezervasyon.musterisi().not );
      worksheet.writeToCell(row, 20, moment.tz(moment(rezervasyon.musterisi().lastModified).format('YYYY-MM-DD HH:mm:ss'), 'YYYY-MM-DD HH:mm:ss', 'UTC').toDate() );
      worksheet.writeToCell(row, 21, rezervasyon.musterisi().revisions ? rezervasyon.musterisi().revisions.length : 'Yok' );

      row++;
    });

    workbook.addSheet('rezervasyonlar', worksheet);

    mkdirp('tmprez', Meteor.bindEnvironment(function (err) {
      if (err) {
        console.log('Rezervasyonlar xlsx dosyasi icin tmp dir yaratirken sorun olustu.', err);
        futureResponse.throw(err);
      }
      else {
        var uuid = UUID.v4();
        var filePath = './tmprez/' + uuid;
        workbook.writeToFile(filePath);

        temporaryFiles.importFile(filePath, {
          filename : uuid,
          contentType: 'application/octet-stream'
        }, function(err, file) {
          if (err) {
            futureResponse.throw(err);
          }
          else {
            futureResponse.return('/gridfs/temporaryFiles/' + file._id);
          }
        });
      }
    }));

    return futureResponse.wait();
  }
});
