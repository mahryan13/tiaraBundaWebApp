const express = require('express')
const app = express()

// Koneksi Database
const dbConnection = require('../db_config/db_connection')

// Multer - Upload Gambar
const multer = require('multer')
const path = require('path')
const maxFileSize = 50 * 1024 * 1204;

// Upload Gambar 
const direktoriGambarBerita = 'views/uploads/berita'
const direktoriProfilSiswa = 'views/uploads/siswa'
const direktoriProfilGuru = 'views/uploads/guru'
let storage = multer.diskStorage({
    destination: function (req, file, callback) {
        if (file.fieldname === 'gambarBerita') {
            callback(null, direktoriGambarBerita);
        } else if (file.fieldname === 'fotoProfilGuru') {
            callback(null, direktoriProfilGuru);
        } else {
            callback(null, direktoriProfilSiswa);
        }
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
let upload = multer({
    storage: storage,
    limits: {
        fileSize: maxFileSize,
        files: 1
    }
});

// Credential Admin
let adminCredential = {
    id: '1',
    username: 'admin',
    password: 'admin'
}

const generateIdSiswa = () => {
    let uniqueId, currentDate, day;
    uniqueId = Math.floor(Math.random() * 1000);
    currentDate = new Date();
    day = currentDate.getDate()
    return 'S' + day + uniqueId;
}

const generateIdGuru = () => {
    let uniqueId, currentDate, day;
    uniqueId = Math.floor(Math.random() * 1000);
    currentDate = new Date();
    day = currentDate.getDate()
    return 'G' + day + uniqueId;
}

const cariDataSiswa = (kelas) => {
    return new Promise((resolve, reject) => {
        dbConnection.con.query('SELECT * FROM dataKelasSiswa WHERE kelas = ?', [kelas], (err, rows) => {
            err ? reject(err) : resolve(rows)
        })
    })
}

const checkTotalSiswa = () => {
    return new Promise((resolve, reject) => {
        dbConnection.con.query('SELECT * FROM dataSiswa', (err, rows) => {
            err ? reject(err) : resolve(rows)
        })
    })
}

const checkTotalGuru = () => {
    return new Promise((resolve, reject) => {
        dbConnection.con.query('SELECT * FROM dataGuru', (err, rows) => {
            err ? reject(err) : resolve(rows)
        })
    })
}

const checkTotalBerita = () => {
    return new Promise((resolve, reject) => {
        dbConnection.con.query('SELECT * FROM dataBerita', (err, rows) => {
            err ? reject(err) : resolve(rows)
        })
    })
}

const checkTotalSaran = () => {
    return new Promise((resolve, reject) => {
        dbConnection.con.query('SELECT * FROM kotakSaran', (err, rows) => {
            err ? reject(err) : resolve(rows)
        })
    })
}

const updatedDataSiswa = () => {
    return new Promise((resolve, reject) => {
        dbConnection.con.query('SELECT * FROM dataSiswa ORDER BY id DESC LIMIT 5', (err, rows) => {
            err ? reject(err) : resolve(rows)
        })
    })
}

const updatedDataGuru = () => {
    return new Promise((resolve, reject) => {
        dbConnection.con.query('SELECT * FROM dataGuru ORDER BY id DESC LIMIT 5', (err, rows) => {
            err ? reject(err) : resolve(rows)
        })
    })
}

const updatedDataBerita = () => {
    return new Promise((resolve, reject) => {
        dbConnection.con.query('SELECT * FROM dataBerita ORDER BY id DESC LIMIT 5', (err, rows) => {
            err ? reject(err) : resolve(rows)
        })
    })
}

const updatedDataKotakSaran = () => {
    return new Promise((resolve, reject) => {
        dbConnection.con.query('SELECT * FROM kotakSaran ORDER BY id DESC LIMIT 5', (err, rows) => {
            err ? reject(err) : resolve(rows)
        })
    })
}

const listDataGuru = () => {
    return new Promise((resolve, reject) => {
        dbConnection.con.query('SELECT id, namaLengkap FROM dataGuru', (err, rows) => {
            err ? reject(err) : resolve(rows)
        })
    })
}

const cariDataGuru = (id) => {
    return new Promise((resolve, reject) => {
        dbConnection.con.query('SELECT namaLengkap FROM dataGuru WHERE id = ?', [id], (err, rows) => {
            err ? reject(err) : resolve(rows)
        })
    })
}

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/panel')
    } else {
        next()
    }
}

const redirectHome = (req, res, next) => {
    if (req.session.userId) {
        res.redirect('/panel/dashboard')
    } else {
        next()
    }
}

app.get('/', (req, res) => {
    res.render('panel/index')
})

app.post('/login', redirectHome, (req, res) => {
    let username = req.body.userName;
    let pass = req.body.userPass;
    if (username === adminCredential.username && pass === adminCredential.password) {
        req.session.userId = adminCredential.id
        res.redirect('/panel/dashboard')
    } else {
        let error_msg = "Username dan Password Salah!"
        req.flash('error', error_msg)
        res.render('panel/index', {
            userName: '',
            userPass: ''
        })
    }
})

app.get('/dashboard', redirectLogin, async (req, res) => {
    const hasilCheckTotalSiswa = await checkTotalSiswa()
    const hasilCheckTotalGuru = await checkTotalGuru()
    const hasilCheckTotalBerita = await checkTotalBerita()
    const hasilCheckTotalSaran = await checkTotalSaran()
    const hasilUpdatedDataSiswa = await updatedDataSiswa()
    const hasilUpdatedDataGuru = await updatedDataGuru()
    const hasilUpdatedDataBerita = await updatedDataBerita()
    const hasilUpdatedDataKotakSaran = await updatedDataKotakSaran()
    res.render('panel/dashboard', {
        totalSiswa: hasilCheckTotalSiswa ? hasilCheckTotalSiswa.length : 0,
        totalGuru: hasilCheckTotalGuru ? hasilCheckTotalGuru.length : 0,
        totalBerita: hasilCheckTotalBerita ? hasilCheckTotalBerita.length : 0,
        totalSaran: hasilCheckTotalSaran ? hasilCheckTotalSaran.length : 0,
        listDataSiswa: hasilUpdatedDataSiswa ? hasilUpdatedDataSiswa : [],
        listDataGuru: hasilUpdatedDataGuru ? hasilUpdatedDataGuru : [],
        listDataBerita: hasilUpdatedDataBerita ? hasilUpdatedDataBerita : [],
        listDataKotakSaran: hasilUpdatedDataKotakSaran ? hasilUpdatedDataKotakSaran : []
    })
})

// Siswa
const fotoProfilSiswa = upload.single('fotoProfil')
app.route('/tambahDataSIswa', redirectLogin)
    .get((req, res) => {
        res.render('panel/admin/siswa/tambahDataSiswa', {
            id: generateIdSiswa(),
            status: 'Siswa'
        })
    })
    .post((req, res) => {
        fotoProfilSiswa(req, res, (err) => {
            if (err) {
                let error_msg = "Besar foto profil siswa melebihi 3 MB!"
                req.flash('error', error_msg)
                res.render('panel/admin/siswa/tambahDataSiswa', {
                    id: generateIdSiswa(),
                    namaLengkap: '',
                    tempatLahir: '',
                    tanggalLahir: '',
                    alamat: '',
                    namaAyah: '',
                    namaIbu: '',
                    nomorTelefon: '',
                    status: 'Siswa',
                    agama: '',
                    jenisKelamin: '',
                })
            } else {
                if (req.file === null) {
                    let error_msg = 'Input foto profil siswa!'
                    req.flash('error', error_msg)
                    res.render('panel/admin/siswa/tambahDataSiswa', {
                        id: generateIdSiswa(),
                        namaLengkap: '',
                        tempatLahir: '',
                        tanggalLahir: '',
                        alamat: '',
                        namaAyah: '',
                        namaIbu: '',
                        nomorTelefon: '',
                        status: 'Siswa',
                        agama: '',
                        jenisKelamin: '',
                    })
                } else {
                    let dataSiswa = {
                        id: generateIdSiswa(),
                        fotoProfil: req.file.filename,
                        namaLengkap: req.sanitize('namaLengkap').escape().trim(),
                        tempatLahir: req.sanitize('tempatLahir').escape().trim(),
                        tanggalLahir: req.sanitize('tanggalLahir').escape().trim(),
                        alamat: req.sanitize('alamat').escape().trim(),
                        namaAyah: req.sanitize('namaAyah').escape().trim(),
                        namaIbu: req.sanitize('namaIbu').escape().trim(),
                        nomorTelefon: req.sanitize('nomorTelefon').escape().trim(),
                        status: 'Siswa',
                        agama: req.sanitize('agama').escape().trim(),
                        jenisKelamin: req.sanitize('jenisKelamin').escape().trim(),
                    }
                    let kelasSiswa = {
                        idSiswa: dataSiswa.id,
                        namaSiswa: req.sanitize('namaLengkap').escape().trim(),
                        kelas: req.sanitize('idKelas').escape().trim(),
                    }
                    dbConnection.con.query('INSERT INTO dataSiswa SET ?', dataSiswa, (err, result) => {
                        if (err) {
                            req.flash('error', err)
                            res.render('panel/admin/siswa/tambahDataSiswa', {
                                id: dataSiswa.id,
                                namaLengkap: dataSiswa.namaLengkap,
                                tempatLahir: dataSiswa.tempatLahir,
                                tanggalLahir: dataSiswa.tanggalLahir,
                                alamat: dataSiswa.alamat,
                                namaAyah: dataSiswa.namaAyah,
                                namaIbu: dataSiswa.namaIbu,
                                nomorTelefon: dataSiswa.nomorTelefon,
                                status: dataSiswa.status,
                                agama: dataSiswa.agama,
                                jenisKelamin: dataSiswa.jenisKelamin,
                            })
                        } else {
                            dbConnection.con.query('INSERT INTO dataKelasSiswa SET ?', kelasSiswa, (err, result) => {
                                if (err) {
                                    req.flash('error', err)
                                    res.render('panel/admin/siswa/tambahDataSiswa', {
                                        id: dataSiswa.id,
                                        namaLengkap: dataSiswa.namaLengkap,
                                        tempatLahir: dataSiswa.tempatLahir,
                                        tanggalLahir: dataSiswa.tanggalLahir,
                                        alamat: dataSiswa.alamat,
                                        namaAyah: dataSiswa.namaAyah,
                                        namaIbu: dataSiswa.namaIbu,
                                        nomorTelefon: dataSiswa.nomorTelefon,
                                        status: dataSiswa.status,
                                        agama: dataSiswa.agama,
                                        jenisKelamin: dataSiswa.jenisKelamin,
                                    })
                                } else {
                                    dbConnection.con.query('INSERT INTO dataNilai SET ?', kelasSiswa, (err, result) => {
                                        if (err) {
                                            req.flash('error', err)
                                            res.render('panel/admin/siswa/tambahDataSiswa', {
                                                id: dataSiswa.id,
                                                namaLengkap: dataSiswa.namaLengkap,
                                                tempatLahir: dataSiswa.tempatLahir,
                                                tanggalLahir: dataSiswa.tanggalLahir,
                                                alamat: dataSiswa.alamat,
                                                namaAyah: dataSiswa.namaAyah,
                                                namaIbu: dataSiswa.namaIbu,
                                                nomorTelefon: dataSiswa.nomorTelefon,
                                                status: dataSiswa.status,
                                                agama: dataSiswa.agama,
                                                jenisKelamin: dataSiswa.jenisKelamin,
                                            })
                                        } else {
                                            req.flash('success', 'Data siswa berhasil ditambahkan!')
                                            res.render('panel/admin/siswa/tambahDataSiswa', {
                                                id: generateIdSiswa(),
                                                namaLengkap: '',
                                                tempatLahir: '',
                                                tanggalLahir: '',
                                                alamat: '',
                                                namaAyah: '',
                                                namaIbu: '',
                                                nomorTelefon: '',
                                                status: 'Siswa',
                                                agama: '',
                                                jenisKelamin: '',
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            }
        })
    })

app.post('/cariDataSiswa', redirectLogin, async (req, res) => {
    let inputKelas = req.body.kelas;
    const hasilCariDataSiswa = await cariDataSiswa(inputKelas);
    res.render('panel/admin/siswa/kelolaDataSiswa', {
        kelas: inputKelas,
        listDataSiswa: hasilCariDataSiswa ? hasilCariDataSiswa : []
    })
})

app.get('/kelolaDataSiswa', redirectLogin, (req, res) => {
    res.render('panel/admin/siswa/kelolaDataSiswa', {
        listDataSiswa: '',
        kelas: 1,
    })
})

app.route('/editDataSiswa/(:id)', redirectLogin)
    .get((req, res) => {
        dbConnection.con.query('SELECT * FROM dataSiswa WHERE id = ?', [req.params.id], (err, rows, fields) => {
            let data = rows[0];
            if (err) {
                res.redirect('/panel/kelolaDataSiswa')
            } else {
                res.render('panel/admin/siswa/editDataSiswa', {
                    id: req.params.id,
                    fotoProfil: data.fotoProfil,
                    namaLengkap: data.namaLengkap,
                    tempatLahir: data.tempatLahir,
                    tanggalLahir: data.tanggalLahir,
                    jenisKelamin: data.jenisKelamin,
                    agama: data.agama,
                    alamat: data.alamat,
                    namaAyah: data.namaAyah,
                    namaIbu: data.namaIbu,
                    nomorTelefon: data.nomorTelefon,
                    status: data.status
                })
            }
        })
    })
    .put((req, res) => {
        let dataSiswa = {
            id: req.params.id,
            alamat: req.sanitize('alamat').escape().trim(),
            nomorTelefon: req.sanitize('nomorTelefon').escape().trim(),
        }
        dbConnection.con.query("UPDATE dataSiswa SET ? WHERE id = ?", [dataSiswa, req.params.id], (err, rows) => {
            if (err) {
                req.flash('error', err)
                res.redirect('/panel/kelolaDataSiswa')
            } else {
                res.redirect('/panel/kelolaDataSiswa')
            }
        })
    })
    .delete((req, res) => {
        dbConnection.con.query('DELETE FROM dataSiswa WHERE id = ?', req.params.id, (err, rows, fields) => {
            if (err) {
                res.redirect('/panel/kelolaDataSiswa')
            } else {
                res.redirect('/panel/kelolaDataSiswa')
            }
        })
    })

// Guru
const fotoProfilGuru = upload.single("fotoProfilGuru")
app.route('/tambahDataGuru', redirectLogin)
    .get((req, res) => {
        res.render('panel/admin/guru/tambahDataGuru', {
            id: generateIdGuru(),
        })
    })
    .post((req, res) => {
        fotoProfilGuru(req, res, (err) => {
            if (err) {
                let error_msg = "Besar foto profil guru melebihi 3 MB!"
                req.flash('error', error_msg)
                res.render('panel/admin/guru/tambahDataGuru', {
                    id: generateIdGuru(),
                    namaLengkap: '',
                    tempatLahir: '',
                    tanggalLahir: '',
                    alamat: '',
                    jenisKelamin: '',
                    agama: '',
                    nomorTelefon: '',
                    email: '',
                    password: ''
                })
            } else {
                if (req.file === null) {
                    let error_msg = 'Input foto profil guru!'
                    req.flash('error', error_msg)
                    res.render('panel/admin/guru/tambahDataGuru', {
                        id: generateIdGuru(),
                        namaLengkap: '',
                        tempatLahir: '',
                        tanggalLahir: '',
                        alamat: '',
                        nomorTelefon: '',
                        jenisKelamin: '',
                        agama: '',
                        email: '',
                        password: ''
                    })
                } else {
                    let dataGuru = {
                        id: generateIdGuru(),
                        fotoProfil: req.file.filename,
                        namaLengkap: req.sanitize('namaLengkap').escape().trim(),
                        tempatLahir: req.sanitize('tempatLahir').escape().trim(),
                        tanggalLahir: req.sanitize('tanggalLahir').escape().trim(),
                        alamat: req.sanitize('alamat').escape().trim(),
                        nomorTelefon: req.sanitize('nomorTelefon').escape().trim(),
                        jenisKelamin: req.sanitize('jenisKelamin').escape().trim(),
                        agama: req.sanitize('agama').escape().trim(),
                        email: req.sanitize('email').escape().trim(),
                        password: req.sanitize('password').escape().trim()
                    }
                    dbConnection.con.query("INSERT INTO dataGuru SET ?", dataGuru, (err, result) => {
                        if (err) {
                            req.flash('error', err)
                            res.render('panel/admin/guru/tambahDataGuru', {
                                id: dataGuru.id,
                                namaLengkap: dataGuru.namaLengkap,
                                tempatLahir: dataGuru.tempatLahir,
                                tanggalLahir: dataGuru.tanggalLahir,
                                alamat: dataGuru.alamat,
                                nomorTelefon: dataGuru.nomorTelefon,
                                jenisKelamin: dataGuru.jenisKelamin,
                                agama: dataGuru.agama,
                                email: dataGuru.email,
                                password: dataGuru.password
                            })
                        } else {
                            req.flash('success', 'Data guru berhasil ditambahkan!')
                            res.render('panel/admin/guru/tambahDataGuru', {
                                id: generateIdGuru(),
                                namaLengkap: '',
                                tempatLahir: '',
                                tanggalLahir: '',
                                alamat: '',
                                nomorTelefon: '',
                                jenisKelamin: '',
                                agama: '',
                                email: '',
                                password: ''
                            })
                        }
                    })
                }
            }
        })
    })

app.get('/kelolaDataGuru', redirectLogin, (req, res) => {
    dbConnection.con.query("SELECT * FROM dataGuru", (err, rows, field) => {
        if (err) {
            res.render('panel/admin/guru/kelolaDataGuru', {
                listGuru: ''
            })
        } else {
            res.render('panel/admin/guru/kelolaDataGuru', {
                listGuru: rows
            })
        }
    })
})

app.route('/editDataGuru/(:id)', redirectLogin)
    .get((req, res) => {
        dbConnection.con.query('SELECT * FROM dataGuru WHERE id = ?', [req.params.id], (err, rows, fields) => {
            let data = rows[0];
            if (err) {
                res.redirect('/panel/kelolaDataGuru')
            } else {
                res.render('panel/admin/guru/editDataGuru', {
                    id: req.params.id,
                    fotoProfil: data.fotoProfil,
                    namaLengkap: data.namaLengkap,
                    tempatLahir: data.tempatLahir,
                    tanggalLahir: data.tanggalLahir,
                    jenisKelamin: data.jenisKelamin,
                    agama: data.agama,
                    alamat: data.alamat,
                    nomorTelefon: data.nomorTelefon,
                    email: data.email,
                    password: data.password
                })
            }
        })
    })
    .put((req, res) => {
        let dataGuru = {
            id: req.params.id,
            namaLengkap: req.sanitize('namaLengkap').escape().trim(),
            tempatLahir: req.sanitize('tempatLahir').escape().trim(),
            tanggalLahir: req.sanitize('tanggalLahir').escape().trim(),
            alamat: req.sanitize('alamat').escape().trim(),
            nomorTelefon: req.sanitize('nomorTelefon').escape().trim(),
            jenisKelamin: req.sanitize('jenisKelamin').escape().trim(),
            agama: req.sanitize('agama').escape().trim(),
            email: req.sanitize('email').escape().trim(),
            password: req.sanitize('password').escape().trim()

        }
        dbConnection.con.query("UPDATE dataGuru SET ? WHERE id = ?", [dataGuru, req.params.id], (err, rows) => {
            if (err) {
                req.flash('error', err)
                res.redirect('/panel/kelolaDataGuru')
            } else {
                res.redirect('/panel/kelolaDataGuru')
            }
        })
    })
    .delete((req, res) => {
        dbConnection.con.query('DELETE FROM dataGuru WHERE id = ?', req.params.id, (err, rows, fields) => {
            if (err) {
                res.redirect('/panel/kelolaDataGuru')
            } else {
                res.redirect('/panel/kelolaDataGuru')
            }
        })
    })

// Jadwal
app.get('/kelolaJadwal', redirectLogin, (req, res) => {
    res.render('panel/admin/jadwalPelajaran/kelolaJadwal')
})

// Kelas
app.get('/kelolaDataKelas', redirectLogin, (req, res) => {
    dbConnection.con.query("SELECT * FROM dataKelas", (err, rows, field) => {
        if (err) {
            res.render('panel/admin/kelas/kelolaDataKelas', {
                listKelas: ''
            })
        } else {
            res.render('panel/admin/kelas/kelolaDataKelas', {
                listKelas: rows
            })
        }
    })
})

app.route('/editDataKelas/(:id)', redirectLogin)
    .get((req, res) => {
        dbConnection.con.query('SELECT * FROM dataKelas WHERE id = ?', [req.params.id], async (err, rows, fields) => {
            let data = rows[0];
            const hasilListDataGuru = await listDataGuru();
            const hasilDataGuru = await cariDataGuru(data.idGuru)
            if (err) {
                res.redirect('/panel/kelolaDataKelas')
            } else {
                res.render('panel/admin/kelas/editDataKelas', {
                    id: req.params.id,
                    kelas: data.kelas,
                    idGuru: data.idGuru,
                    namaGuru: hasilDataGuru[0].namaLengkap,
                    listDataGuru: hasilListDataGuru
                })
            }
        })
    })
    .put((req, res) => {
        let dataKelas = {
            id: req.params.id,
            kelas: req.sanitize('kelas').escape().trim(),
            idGuru: req.sanitize('idGuru').escape().trim(),
        }
        dbConnection.con.query("UPDATE dataKelas SET ? WHERE id = ?", [dataKelas, req.params.id], (err, rows) => {
            if (err) {
                req.flash('error', err)
                res.render('panel/admin/kelas/editDataKelas', {
                    id: req.params.id,
                    kelas: dataKelas.kelas,
                    idGuru: dataKelas.idGuru,
                })
            } else {
                res.redirect('/panel/kelolaDataKelas')
            }
        })
    })

// Berita
const gambarBerita = upload.single('gambarBerita')
app.route('/tambahDataBerita', redirectLogin)
    .get((req, res) => {
        res.render('panel/admin/berita/tambahDataBerita', {
            penulis: adminCredential.username
        })
    })
    .post((req, res) => {
        gambarBerita(req, res, (err) => {
            if (err) {
                let error_msg = "Besar gambar berita melebihi 3 MB!"
                req.flash('error', error_msg)
                res.render('panel/admin/berita/tambahDataBerita', {
                    judulBerita: '',
                    tanggalUpdate: '',
                    penulis: adminCredential.username,
                    deskripsiBerita: ''
                })
            } else {
                if (req.file === null) {
                    let error_msg = "Input gambar berita!"
                    req.flash('error', error_msg)
                    res.render('panel/admin/berita/tambahDataBerita', {
                        judulBerita: '',
                        tanggalUpdate: '',
                        penulis: adminCredential.username,
                        deskripsiBerita: ''
                    })
                } else {
                    let dataBerita = {
                        gambarBerita: req.file.filename,
                        judulBerita: req.sanitize("judulBerita").escape().trim(),
                        tanggalUpdate: req.sanitize("tanggalUpdate").escape().trim(),
                        deskripsi: req.sanitize("deskripsiBerita").escape().trim(),
                        penulis: adminCredential.username
                    }
                    dbConnection.con.query("INSERT INTO dataBerita SET ?", dataBerita, (err, result) => {
                        if (err) {
                            req.flash('error', err)
                            res.render('panel/admin/berita/tambahDataBerita', {
                                judulBerita: dataBerita.gambarBerita,
                                tanggalUpdate: dataBerita.tanggalUpdate,
                                penulis: adminCredential.username,
                                deskripsiBerita: dataBerita.deskripsi
                            })
                        } else {
                            req.flash('success', "Berita berhasil ditambakan!")
                            res.render('panel/admin/berita/tambahDataBerita', {
                                gambarBerita: '',
                                judulBerita: '',
                                tanggalUpdate: '',
                                penulis: adminCredential.username,
                                deskripsiBerita: ''
                            })
                        }
                    })
                }
            }
        })
    })

app.get('/kelolaDataBerita', redirectLogin, (req, res) => {
    dbConnection.con.query("SELECT * FROM dataBerita", (err, rows, field) => {
        if (err) {
            res.render('panel/admin/berita/kelolaDataBerita', {
                listBerita: ''
            })
        } else {
            res.render('panel/admin/berita/kelolaDataBerita', {
                listBerita: rows
            })
        }
    })
})

app.route('/editDataBerita/(:id)', redirectLogin)
    .get((req, res) => {
        dbConnection.con.query('SELECT * FROM dataBerita WHERE id = ?', [req.params.id], (err, rows, fields) => {
            let data = rows[0]
            if (err) {
                res.redirect('/panel/kelolaDataBerita')
            } else {
                res.render('panel/admin/berita/editDataBerita', {
                    id: data.id,
                    judulBerita: data.judulBerita,
                    tanggalUpdate: data.tanggalUpdate,
                    deskripsi: data.deskripsi,
                    penulis: data.penulis
                })
            }
        })
    })
    .put((req, res) => {
        let dataBerita = {
            id: req.params.id,
            judulBerita: req.sanitize('judulBerita').escape().trim(),
            tanggalUpdate: req.sanitize('tanggalUpdate').escape().trim(),
            deskripsi: req.sanitize('deskripsiBerita').escape().trim(),
            penulis: req.sanitize('penulis').escape().trim()
        }
        dbConnection.con.query("UPDATE dataBerita SET ? WHERE id = ?", [dataBerita, req.params.id], (err, rows) => {
            if (err) {
                req.flash('error', err)
                res.render('panel/admin/berita/editDataBerita', {
                    id: req.params.id,
                    judulBerita: dataBerita.judulBerita,
                    tanggalUpdate: dataBerita.tanggalUpdate,
                    deskripsi: dataBerita.deskripsi,
                    penulis: dataBerita.penulis
                })
            } else {
                res.redirect('/panel/kelolaDataBerita')
            }
        })
    })
    .delete((req, res) => {
        dbConnection.con.query('DELETE FROM dataBerita WHERE id = ?', req.params.id, (err, rows, fields) => {
            if (err) {
                res.redirect('/panel/kelolaDataBerita')
            } else {
                res.redirect('/panel/kelolaDataBerita')
            }
        })
    })

// Kotak Saran
app.get('/kelolaKotakSaran', redirectLogin, (req, res) => {
    dbConnection.con.query("SELECT * FROM kotakSARAN", (err, rows, field) => {
        if (err) {
            res.render('panel/admin/kotakSaran/kelolaKotakSaran', {
                listSaran: ''
            })
        } else {
            res.render('panel/admin/kotakSaran/kelolaKotakSaran', {
                listSaran: rows
            })
        }
    })
})

app.route('/detailSaran/(:id)', redirectLogin)
    .get((req, res) => {
        dbConnection.con.query('SELECT * FROM kotakSaran WHERE id = ?', [req.params.id], (err, rows, fields) => {
            if (err) {
                res.redirect('/panel/kelolaKotakSaran')
            } else {
                res.render('panel/admin/kotakSaran/detailSaran', {
                    id: rows[0].id,
                    namaLengkap: rows[0].namaLengkap,
                    email: rows[0].email,
                    nomorTelefon: rows[0].nomorTelefon,
                    saran: rows[0].saran
                })
            }
        })
    })
    .delete((req, res) => {
        dbConnection.con.query('DELETE FROM kotakSaran WHERE id = ?', req.params.id, (err, rows, fields) => {
            if (err) {
                res.redirect('/panel/kelolaKotakSaran')
            } else {
                res.redirect('/panel/kelolaKotakSaran')
            }
        })
    })

app.post('/logout', redirectLogin, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            res.redirect('panel/dashboard')
        } else {
            res.clearCookie('sid')
            res.redirect('/panel')
        }
    })
})

module.exports = app