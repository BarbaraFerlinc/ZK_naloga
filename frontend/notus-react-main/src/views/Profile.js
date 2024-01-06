import React, { useState } from "react";
import { useEffect } from "react";
import { UserAuth } from "context/AuthContext";
import { Link } from "react-router-dom";

import Navbar from "components/Navbars/AuthNavbar.js";
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footers/Footer.js";
import api from "services/api";
import { useNavigate } from "react-router-dom"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function Profile({ izbris }) {

  const [uporabnik, setUporabnik] = useState({});
  const [uporabnikovId, setUporabnikovId] = useState(0);
  const [oglasi, setOglasi] = useState([]);
  const [profil, setProfil] = useState(null);
  const [zamenjaniOglasi, setZamenjaniOglasi] = useState([]);

  const { user, logout } = UserAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (e) {
      console.log(e.message);
    }
  }

  let ocena = 0;
  let komentarji = [];
  let artikli = [];

  useEffect(() => {
    if (user.email) {
      const uporabnikovEmail = user.email;

      api.post('uporabnik/prijavljen-uporabnik', { email: uporabnikovEmail })
        .then(res => {
          const userId = res.data.userId;
          setUporabnikovId(userId);
        })
        .catch(err => {
          console.error(err);
        });

      api.post('uporabnik/prijavljen-profil', { email: uporabnikovEmail })
        .then(res => {
          const uporabnik_profil = res.data.user;
          setProfil(uporabnik_profil);
        })
        .catch(err => {
          console.error(err);
        });
    }
  }, [user.email]);

  const steviloKomentarjev = () => { };

  const izracunajOceno = () => { };

  const fetchUser = async (id) => {
    try {
      const response = await api.get(`/uporabnik/${id}`);
      setUporabnik(response.data[0]);
    } catch (error) {
      console.error("Napaka pri pridobivanju uporabika", error);
    }
  };

  const fetchOglasi = async (id) => {
    try {
      const response = await api.get(`/artikel/profil/${id}`);
      const filteredOglasi = response.data.filter(filteredOglas => filteredOglas.jeZamenjan === 0);
      setOglasi(filteredOglasi);
    } catch (error) {
      console.error("Napaka pri pridobivanju oglasov uporabnika", error);
    }
  };

  const fetchZamenjani = async (id) => {
    try {
      const response = await api.get(`/zamenjava/zamenjanii/${id}`);
      const filteredZamenjani = response.data.filter(zamenjanOglas => zamenjanOglas.jePotrjen === 0);
      setZamenjaniOglasi(filteredZamenjani);
    } catch (error) {
      console.error("Napaka pri pridobivanju zamenjanih uporabnika", error);
    }
  };

  const fetchPreberiNotifikacije = async (id) => {
    try {
      const response = await api.post(`/zamenjava/preberi`, { userId: id });
    } catch (error) {
      console.error("Napaka pri pridobivanju zamenjanih uporabnika", error);
    }
  };

  useEffect(() => {
    if (user.email && uporabnikovId) {
      fetchUser(uporabnikovId);
      fetchOglasi(uporabnikovId);
      fetchZamenjani(uporabnikovId);
      fetchPreberiNotifikacije(uporabnikovId);
      steviloKomentarjev();
      izracunajOceno();
    }

  }, [uporabnikovId]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/artikel/${id}`);
      fetchOglasi(uporabnikovId);
      izbris(id);

      toast.warning(' Uspešno ste izbrisali oglas!', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });

    } catch (error) {
      console.error("Error deleting advertisement", error);
    }
  };

  return (
    <>
      <IndexNavbar fixed={true}></IndexNavbar>
      <main className="profile-page">
        <section className="relative block h-500-px">
          <div
            className="absolute top-0 w-full h-full bg-center bg-cover"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1499336315816-097655dcfbda?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2710&q=80')",
            }}
          >
            <span
              id="blackOverlay"
              className="w-full h-full absolute opacity-50 bg-black"
            ></span>
          </div>
          <div
            className="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px"
            style={{ transform: "translateZ(0)" }}
          >
            <svg
              className="absolute bottom-0 overflow-hidden"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              version="1.1"
              viewBox="0 0 2560 100"
              x="0"
              y="0"
            >
              <polygon
                className="text-blueGray-200 fill-current"
                points="2560 0 2560 100 0 100"
              ></polygon>
            </svg>
          </div>
        </section>
        <section className="relative py-16 bg-blueGray-200">
          <div className="container mx-auto px-4">
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg -mt-64">
              <div className="px-6">
                <div className="flex flex-wrap justify-center">
                  <div className="w-full lg:w-3/12 px-4 lg:order-2 flex justify-center">
                    <div className="relative">
                      {profil ?
                        <div
                          className="shadow-xl rounded-full h-auto align-middle border-none absolute -m-16 -ml-20 lg:-ml-16 max-w-150-px text-5xl font-bold text-blueGray-700 flex items-center justify-center"
                          style={{ height: '150px', width: '150px', backgroundColor: "#d8b4fe" }}
                        >
                          {profil.ime[0]}{profil.priimek[0]}
                        </div>
                        :
                        <img
                          alt="..."
                          src={require("assets/img/team-2-800x800.jpg").default}
                          className="shadow-xl rounded-full h-auto align-middle border-none absolute -m-16 -ml-20 lg:-ml-16 max-w-150-px"
                        />
                      }
                    </div>
                  </div>

                  <div className="w-full lg:w-4/12 px-4 lg:order-3 lg:text-right lg:self-center">
                    <div className="py-6 px-3 mt-32 sm:mt-0">
                      <button className="bg-pink-500 text-white active:bg-pink-600 font-bold uppercase text-sm px-6 py-3 rounded-full shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                        onClick={handleLogout}>
                        Odjava
                      </button>
                    </div>
                  </div>
                  <div className="w-full lg:w-4/12 px-4 lg:order-1">
                    <div className="flex justify-center py-4 lg:pt-4 pt-8">
                      <div className="lg:mr-4 p-3 text-center">
                        <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">
                          {oglasi.length}
                        </span>
                        <span className="text-sm text-blueGray-400">
                          Artiklov
                        </span>
                      </div>
                      <div className="lg:mr-4 p-3 text-center">
                        <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600">
                          {zamenjaniOglasi.length}
                        </span>
                        <span className="text-sm text-blueGray-400">
                          Zamenjav
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-12">
                  <h3 className="text-4xl font-semibold leading-normal mb-2 text-blueGray-700 mb-2">
                    {profil?.ime} {profil?.priimek}
                  </h3>
                  <div className="mb-2 text-blueGray-600 mt-4">
                    <i className="fas fa-info-circle mr-2 text-lg text-blueGray-400"></i>
                    {profil?.email}
                  </div>
                  <div className="mb-2 text-blueGray-600 mt-4">
                    <i className="fas fa-phone mr-2 text-lg text-blueGray-400"></i>
                    {profil?.telefon}
                  </div>
                  <div className="mb-2 text-blueGray-600 mt-4">
                    <i className="fas fa-map-marker mr-2 text-lg text-blueGray-400"></i>
                    {profil?.naslov}, {profil?.posta}
                  </div>
                  <div className="mb-2 text-blueGray-600 mt-4">
                    <i className="fas fa-flag mr-2 text-lg text-blueGray-400"></i>
                    {profil?.drzava}
                  </div>
                </div>

                <div className="mt-10 py-10 border-t border-blueGray-200 text-center">
                  <div className="flex flex-wrap justify-center">
                    <div className="w-full lg:w-9/12 px-4">
                      <div className="flex flex-wrap justify-center">
                        <div className="w-full lg:w-9/12 px-4">
                          <h6 className="text-2xl font-semibold leading-normal text-blueGray-700 mb-4">Moji oglasi</h6>
                          {oglasi && oglasi?.length > 0 ? (
                            <div>
                              <div className="flex justify-center">
                                <table className="min-w-full border divide-y divide-blueGray-400">
                                  <thead className="bg-blueGray-500">
                                  </thead>
                                  <tbody className="bg-blueGray-100 divide-y divide-blueGray-300">
                                    {oglasi.map((oglas, index) => (
                                      <tr key={oglas.id} className="bg-blueGray-100">
                                        <Link to={`/oglas/${oglas.id}`}>
                                          <td className="py-2 px-4 text-left">{oglas?.naslov}</td>
                                        </Link >
                                        <td className="py-2 px-4">
                                          <i className="fas fa-trash-alt hover:text-red-500 transition-colors" style={{ color: '#ff0000', fontSize: '20px', cursor: 'pointer' }} onClick={() => handleDelete(oglas.id)}></i>
                                        </td>
                                        <td className="py-2 px-4">
                                          <Link to={`/urejanje-oglasa/${oglas.id}`}>
                                            <i className="fas fa-edit hover:text-blue-500 transition-colors" style={{ color: '#0000ff', fontSize: '20px' }}></i>
                                          </Link>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              <br></br><br></br>
                              <h6 className="text-2xl font-semibold leading-normal text-blueGray-700 mb-4">Ponudbe za zamenjavo</h6>
                              <div className="flex justify-center">
                                <table className="min-w-full border divide-y divide-blueGray-400">
                                  <thead className="bg-blueGray-500">
                                    <tr>
                                      <th className="py-3 px-3 text-left"></th>
                                      <th className="py-3 px-3 text-left">Naziv</th>
                                      <th className="py-3 px-3 text-left">Ponudnik</th>
                                      <th className="py-3 px-3 text-left">Za oglas</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-blueGray-100">
                                    {zamenjaniOglasi?.map((oglas, index) => (
                                      <tr key={oglas.id} className="bg-blueGray-200">
                                        <Link to={`/oglas-zamenjan/${oglas.id}`}>
                                          <td className="py-3 px-3">📝</td>
                                        </Link>
                                        <td className="py-3 px-3">
                                          <Link to={`/oglas-zamenjan/${oglas.id}`}>
                                            {oglas?.naslov}
                                          </Link>
                                        </td>
                                        <td className="py-3 px-3">{oglas?.ime} {oglas?.priimek}</td>
                                        <td className="py-3 px-3">{oglas?.naslov_oglasa}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>

                              </div>
                            </div>
                          ) : (
                            <p className="text-xl text-blueGray-500">Nimate objavljenih oglasov!</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main >
      <Footer />
      <ToastContainer />
    </>
  );
}
