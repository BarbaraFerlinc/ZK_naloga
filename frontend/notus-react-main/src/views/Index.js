import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import api from "services/api";
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footers/Footer.js";
import "../components/Dropdown.css";
import jsPDF from "jspdf";
import "jspdf-autotable";

import dotenv from 'dotenv';

export const generatePdf = (imeKupca, imeProdajalca, cena, stevilkaRacuna, imeArtikla, imeDrugegaArtikla, nacinPlacila, osebniPrevzem, lokacijaPrevzema) => {
  var doc = new jsPDF('portrait', 'px', 'a4', 'false');

  doc.setFont('Arial', 'bold');
  doc.setFontSize(36);
  doc.setTextColor('#333');

  doc.text('Racun', 30, 60);

  doc.setFont('Arial', 'normal');
  doc.setFontSize(16);
  doc.setTextColor('#555');

  doc.text('Kupec:', 30, 100);
  doc.text(imeKupca, 150, 100);

  doc.text('Prodajalec:', 30, 120);
  doc.text(imeProdajalca, 150, 120);

  doc.text('Stevilka racuna:', 30, 140);
  doc.text(stevilkaRacuna, 150, 140);

  if (!nacinPlacila) {
    doc.text('Nacin placila:', 30, 160);
    doc.text("Zamenjava", 150, 160);

    doc.text('Nacin prevzema:', 30, 180);
    doc.text("Po dogovoru", 150, 180);
  } else {
    doc.text('Nacin placila:', 30, 160);
    doc.text(nacinPlacila, 150, 160);

    if (osebniPrevzem) {
      doc.text('Nacin prevzema:', 30, 180);
      doc.text("Osebni prevzem (" + lokacijaPrevzema + ")", 150, 180);
    } else {
      doc.text('Nacin prevzema:', 30, 180);
      doc.text("Dostava na dom", 150, 180);
    }
  }

  const currentDate = new Date().toLocaleDateString('sl-SI');
  doc.setTextColor('#777');
  doc.setFontSize(12);
  doc.text(currentDate, doc.internal.pageSize.getWidth() - 30, 40, { align: 'right' });

  const items = [
    { name: imeArtikla, price: cena },

  ];

  if (nacinPlacila) {
    doc.autoTable({
      startY: 200,
      margin: { top: 180 },
      head: [['Artikel', 'Cena']],
      body: items.map(item => [item.name, item.price + ' €']),
      theme: 'grid',
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 80, halign: 'right' },
      },
    });
  } else {
    items.push({ name: imeDrugegaArtikla, price: "/" });
    doc.autoTable({
      startY: 200,
      margin: { top: 180 },
      head: [['Zamenjana artikla', 'Okvirna cena']],
      body: items.map(item => [item.name, item.price + ' €']),
      theme: 'grid',
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 80, halign: 'right' },
      },
    });
  }

  doc.setTextColor('#555');
  doc.setFontSize(16);

  if (nacinPlacila) {
    doc.text('Koncna cena:', 30, doc.autoTable.previous.finalY + 20);
    doc.text(cena + ' €', 150, doc.autoTable.previous.finalY + 20);
  }

  doc.setDrawColor('#ccc');
  doc.setLineWidth(1);
  doc.rect(20, 80, doc.internal.pageSize.getWidth() - 40, doc.autoTable.previous.finalY - 80 + 40);

  doc.setFont('Arial', 'bold');
  doc.setFontSize(24);
  doc.setTextColor('#333');

  const reclothX = doc.internal.pageSize.getWidth() / 2;
  const reclothY = doc.autoTable.previous.finalY + 80;

  doc.text('ReCloth', reclothX, reclothY, { align: 'center' });

  return doc.output('datauristring');
  //doc.save('racun.pdf');
}

export default function Index({ seznamOglasov }) {
  const [kategorije, setKategorije] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedZamenjava, setSelectedZamenjava] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedVelikost, setSelectedVelikost] = useState("");

  dotenv.config();

  let nov = seznamOglasov.filter(filteredOglas => filteredOglas.jeZamenjan === 0)

  const handleRefresh = () => {
    window.location.reload();
  };

  useEffect(() => {
    const fetchKategorije = async () => {
      try {
        const response = await api.get('/kategorija/vsi');
        setKategorije(response.data);
      } catch (error) {
        console.error("Napaka pri pridobivanju kategorij", error);
      }
    };

    fetchKategorije();
  }, []);

  const filteredOglasi = nov.filter(oglas =>
    (selectedCategory ? oglas.kategorijaNaziv === selectedCategory : true) &&
    (selectedZamenjava ? oglas.za_zamenjavo.toString() === selectedZamenjava : true) &&
    (selectedVelikost ? oglas.velikost === selectedVelikost : true) &&
    oglas.lokacija.toLowerCase().includes(searchLocation.toLowerCase())
  );

  return (
    <>
      <IndexNavbar fixed={true}></IndexNavbar>
      <div className="flex items-center mb-8 px-4 pt-20 ml-4" style={{ marginLeft: "17px" }}>
        <div className="w-full sm:w-5/12 px-4">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md mr-4 custom-select mt-4"
          >
            <option value="">Vse</option>
            {kategorije.map(kategorija => (
              <option key={kategorija.id} value={kategorija.naziv}>{kategorija.naziv}</option>
            ))}
          </select>

          <select
            value={selectedZamenjava}
            onChange={e => setSelectedZamenjava(e.target.value)}
            className="px-10 py-2 border border-gray-300 rounded-md mr-4 custom-select mt-4"
          >
            <option value="">Način nakupa</option>
            <option value="0">Ni možna zamenjava</option>
            <option value="1">Možna zamenjava</option>
          </select>

          <select
            value={selectedVelikost}
            onChange={e => setSelectedVelikost(e.target.value)}
            className="px-10 py-2 border border-gray-300 rounded-md mr-4 custom-select mt-4"
          >
            <option value="">Velikost</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
            <option value="110">110</option>
            <option value="116">116</option>
            <option value="122">122</option>
            <option value="128">128</option>
            <option value="134">134</option>
            <option value="140">140</option>
            <option value="146">146</option>
            <option value="152">152</option>
            <option value="158">158</option>
            <option value="164">164</option>
          </select>
          <input
            type="text"
            value={searchLocation}
            onChange={e => setSearchLocation(e.target.value)}
            placeholder="Vnesite lokacijo"
            className="px-4 py-2 border border-gray-300 rounded-md custom-input mr-4 mt-4"
          />

          <div className="flex-grow"></div>

          <button
            onClick={handleRefresh}
            style={{
              //light blue 
              backgroundColor: "#60A5FA",
              color: "white",
              border: "none",
              borderRadius: "20px",
              padding: "10px", // Adjusted padding
              fontSize: "15px", // Adjusted font size
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
              transition: "background-color 0.3s ease",
              marginTop: "15px"
              //marginLeft: "15px"
            }}
            type="button"
          >
            Prikaži vse
          </button>
        </div>


      </div>


      <section className="pt-10 pb-15 px-4 md:px-0">
        <br></br>
        {seznamOglasov.length === 0 || filteredOglasi.length === 0 ? (
          <div className="text-center my-8">
            <h2 className="text-2xl font-bold text-gray-800">Ni oglasov za prikaz!</h2>
          </div>
        ) : (
          <div className="flex flex-wrap -mx-4">
            {filteredOglasi.map((oglas, index) => {
              const delimiter = oglas.slike[0].includes("\\") ? "\\" : "/";
              const slikaPath = oglas.slike[0].split(delimiter).pop();
              return (
                <div
                  key={oglas.id}
                  className={`w-full sm:w-6/12 md:w-4/12 lg:w-4/12 xl:w-4/12 px-4 mb-6`}
                >
                  <div className="card relative flex flex-col min-w-0 break-words w-full mb-8 shadow-lg rounded-lg" style={{ backgroundColor: "#F1F5F9" }}>
                    <div className="px-4 py-5 flex-auto">
                      <Link to={`/oglas/${oglas.id}`} className="card-link">
                        <img
                          alt="..."
                          className="w-full align-middle rounded-lg"
                          src={`${process.env.REACT_APP_BASE_URL}uploads/${slikaPath}`}
                          style={{ objectFit: "cover", objectPosition: "center", height: "400px", width: "100%" }}
                        />
                      </Link>
                      <div className="mt-4">
                        <h5 className="card-title text-xl font-bold">
                          <Link to={`/oglas/${oglas.id}`} className="card-link text-black">
                            {oglas.naslov}
                          </Link>
                        </h5>
                        <h6 className="card-subtitle mt-2 text-black">{oglas.cena} €</h6>
                        {/* <h6 className="card-subtitle mt-2 text-black">{oglas.kategorijaNaziv}</h6>
                        <h6 className="card-subtitle mt-2 text-black">{oglas.za_zamenjavo}</h6> */}
                      </div>
                    </div>
                    <div className="px-4 py-2">
                      <Link to={`/oglas/${oglas.id}`}>
                        <button className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded-full shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button">
                          Več
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      <br></br>
      <Footer />
    </>
  )
}
