import React, { useEffect, useState } from "react";
import api from "services/api";
import { UserAuth } from "context/AuthContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams } from "react-router-dom";
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footers/Footer";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Slider from "react-slick"; // uvozite knjižnico "react-slick" za drsnik slik
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom"
import { generatePdf } from "./Index";

import dotenv from 'dotenv';

export default function PodrobnostiZamenjanega({ izbris }) {
    const [izbira, setIzbira] = useState("");
    const [oglas, setOglas] = useState();
    const [error, setError] = useState(null);

    const [prodajalec, setProdajalec] = useState({});
    const [kupec, setKupec] = useState({});

    const navigate = useNavigate();
    const [clicked, setClicked] = useState(null);
    const [uporabnikovEmail, setUporabnikovEmail] = useState("");
    const [errorIzBaze, setErrorIzBaze] = useState(null);
    const [errorIzBaze2, setErrorIzBaze2] = useState(null);
    const [uporabnikovId, setUporabnikovId] = useState(0);

    const { user } = UserAuth();
    const { id } = useParams();
    let parsan_id;
    if (id !== undefined) {
        parsan_id = parseInt(id, 10);
    } else {
        parsan_id = undefined;
    }

    dotenv.config();

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1
    };

    useEffect(() => {
        if(parsan_id === undefined) return;
        api.get(`/zamenjava/${parsan_id}`)
            .then(res => {
                setIzbira(res.data)
            })
            .catch(err => {
                console.error(err);
                if (err.response && err.response.data && err.response.data.error) {
                    setErrorIzBaze(err.response.data.error);
                } else {
                    setErrorIzBaze("Napaka pri pridobivanju podatkov");
                }
            });
    }, [parsan_id]);


    useEffect(() => {
        if(user.email){
        const uporabnikovEmail = user.email;

        api.post('uporabnik/prijavljen-profil', { email: uporabnikovEmail })
            .then(res => {
                const uporabnik_profil = res.data.user;
                setProdajalec(uporabnik_profil);
            })
            .catch(err => {
                console.error(err);
            });
        }
    }, [user.email]);


    const dobiKupca = async () => {
        try {
            const response = await api.get(`/uporabnik/${izbira?.fk_uporabnik_id}`);
            setKupec(response.data)
        } catch (error) {
            console.error("Napaka pri pridobivanju kupca", error);
        }
    };

    useEffect(() => {
        if (!izbira) return;
        api.get(`/artikel/${izbira?.fk_oglas_id}`)
            .then(res => {
                setOglas(res.data);
            })

            .catch(err => {
                console.error(err);
                if (err.response && err.response.data && err.response.data.error) {
                    console.log("error message:", err.response.data.error);
                } else {
                    console.log("error message: Napaka pri pridobivanju podatkov");
                }
            });
        dobiKupca();
    }, [izbira]);

    const posljiPotrdilo = async (e) => {
        let kupecIme = kupec.ime + " " + kupec.priimek;
        let prodajalecIme = prodajalec.ime + " " + prodajalec.priimek;
        let stevilkaRacuna = 'oglas_' + oglas.id;

        const podatki = {
            subject: 'Potrdilo zamenjave',
            body: `Potrdilo zamenjave.\n\nKupec: ${kupecIme} (${kupec.email})\nProdajalec: ${prodajalecIme} (${prodajalec.email})\nŠtevilka nakupa: oglas_${oglas.id}\nNačin plačila: Zamenjava\nNacin prevzema: Po dogovoru`,
            to: [kupec.email, prodajalec.email],
        }

        const pdfDataUri = generatePdf(kupecIme, prodajalecIme, oglas.cena, stevilkaRacuna, oglas.naslov, izbira.naslov);
        podatki.pdfDataUri = pdfDataUri;

        const res = await api.post("/mail/poslji", podatki, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
    }

    const posljiZavrnitev = async () => {
        let kupecIme = kupec.ime + " " + kupec.priimek;
        let prodajalecIme = prodajalec.ime + " " + prodajalec.priimek;

        const podatki = {
            subject: 'Zavrnitev zamenjave',
            body: `Zamenjava je bila zavrnjena.\n\nKupec: ${kupecIme} (${kupec.email})\nProdajalec: ${prodajalecIme} (${prodajalec.email})\nŠtevilka oglasa: oglas_${oglas.id}`,
            to: [kupec.email, prodajalec.email],
        }

        const res = await api.post("/mail/poslji", podatki, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
    }

    const handleSprejmiClick = () => {
        if(!izbira) return;
        api.post('obvestilo/dodaj', {
            fk_oglas_id: izbira?.fk_oglas_id,
            fk_uporabnik_id: izbira?.fk_uporabnik_id,
            jeSprejeto: 2,
            potrjenaZamenjava: izbira?.id
        })
            .then(response => {
                if (response.status === 200) {
                    izbris();

                    toast.success(' Sprejeli ste zamenjavo! Podrobnosti o le tej lahko pogledate med obvestili.', {
                        position: "top-center",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });

                    setTimeout(() => {
                        navigate('/');
                    }, 3000);
                }
            })
            .catch(error => {
                console.error(error);
                if (error.response && error.response.data && error.response.data.error) {
                    setErrorIzBaze2(error.response.data.error);

                    toast.warning(error.response.data.error, {
                        position: "top-center",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });
                    
                    izbris();
                    setTimeout(() => {
                        navigate('/');
                    }, 3000);

                } else {
                    setErrorIzBaze2("Napaka pri pridobivanju podatkov");
                }
            });
        posljiPotrdilo();


    };

    const handleZavrniClick = () => {
        if(!izbira) return;
        api.post('obvestilo/dodaj2', {
            fk_oglas_id: izbira?.fk_oglas_id,
            fk_uporabnik_id: izbira?.fk_uporabnik_id,
            jeSprejeto: 1
        })
            .then(response => {
                if (response.status === 200) {
                    izbris();

                    toast.warning(' Zavrnili ste zamenjavo! Podrobnosti o le tej lahko pogledate med obvestili.', {
                        position: "top-center",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "colored",
                    });

                    setTimeout(() => {
                        navigate('/');
                    }, 3000);
                }
            })
            .catch(error => {
                console.error(error);
            });
        posljiZavrnitev();
    };

    return (
        <>
            {errorIzBaze ? (
                <div className="text-center mt-12">
                    <h3 className="text-4xl font-semibold leading-normal mb-2 text-blueGray-700 mb-2">
                        Ta izmenjava ne obstaja
                    </h3>
                    <Link to="/">
                        <button className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded-full shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button" onClick={izbris()}>
                            Pojdi nazaj
                        </button>
                    </Link>
                </div>

            ) : (
                <div>
                    <IndexNavbar fixed={true} />
                    <section className="relative py-16 bg-blueGray-200">
                        <div className="container mx-auto px-4">
                            <div className="relative flex flex-col min-w-0 break-words bg-white w-full md:w-3/4 mx-auto mt-24 mb-4 shadow-xl rounded-lg">
                                <div className="px-6">
                                    <div className="text-center mt-12">
                                        <h3 className="text-4xl font-semibold leading-normal mb-2 text-blueGray-700 mb-2">
                                            {izbira?.naslov}
                                        </h3>
                                        <div className="mb-2 text-blueGray-600 mt-4">
                                            <i className="fas fa-ruler-combined mr-2 text-lg text-blueGray-400"></i>
                                            Velikost: {izbira?.velikost}
                                        </div>
                                        <div className="mb-2 text-blueGray-600 mt-4">
                                            <i className="fas fa-info-circle mr-2 text-lg text-blueGray-400"></i>
                                            Opis: <br></br>{izbira?.opis}
                                        </div>
                                        <Link to={`/prodajalec/${izbira?.uporabnik?.id}`}>
                                            <div className="mb-2 text-blueGray-900 mt-4">
                                                <i className="fas fa-user mr-2 text-lg text-blueGray-900"></i>
                                                Rad bi zamenjal: {izbira?.uporabnik?.ime} {izbira?.uporabnik?.priimek}
                                            </div>
                                        </Link >
                                        <br></br>
                                        <div className="relative flex flex-col min-w-0 break-words bg-blueGray-200 w-full md:w-3/4 mx-auto mb-20 shadow-xl rounded-lg">
                                            <div className="px-6">
                                                <section className="relative block" style={{ height: "70vh" }}>
                                                    <br></br>
                                                    {<Slider {...settings}>
                                                        {izbira?.slike?.map((slika, index) => {
                                                            const delimiter = slika.includes("\\") ? "\\" : "/";
                                                            const slikaPath = slika.split(delimiter).pop();
                                                            return (
                                                                <div key={index} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                                    <img
                                                                        alt={`slika-${index}`}
                                                                        className="w-full align-middle rounded-lg"
                                                                        src={`${process.env.REACT_APP_BASE_URL}uploads/${slikaPath}`}
                                                                        style={{
                                                                            objectFit: "cover",
                                                                            height: "60vh",
                                                                            width: "60%",
                                                                            margin: "auto",
                                                                        }}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </Slider>}
                                                </section>
                                            </div>
                                        </div>
                                        <div className="flex justify-center mt-10 mb-8">
                                            <button
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white active:bg-emerald-700 font-bold uppercase text-sm px-6 py-3 rounded-full shadow focus:outline-none transition-colors duration-300"
                                                type="button"
                                                onClick={handleSprejmiClick}
                                            >
                                                Sprejmi
                                            </button>
                                            &nbsp;
                                            <button
                                                className="bg-red-500 hover:bg-red-600 text-white active:bg-red-700 font-bold uppercase text-sm px-6 py-3 rounded-full shadow focus:outline-none transition-colors duration-300"
                                                type="button"
                                                onClick={handleZavrniClick}
                                            >
                                                Zavrni
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </section >
                    <Footer />
                </div>
            )}
            <ToastContainer />
        </>
    );

}




