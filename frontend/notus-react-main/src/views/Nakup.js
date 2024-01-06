import React, { useState, useEffect } from "react";
import { UserAuth } from "context/AuthContext";
import api from "services/api";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import IndexNavbar from "components/Navbars/IndexNavbar.js";
import Footer from "components/Footers/Footer.js";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { generatePdf } from "./Index";
import "../components/Dropdown.css";

const initialState = {
    osebni_prevzem: 0,
    nacin_placila: "",
    fk_uporabnik_id: 0,
    fk_oglas_id: 0,
}

const podatki_kartice = {
    stevilka: "",
    ime: "",
    datum_poteka: "",
    varnostna_koda: ""
}

export default function Nakup({ izbris }) {
    const { id } = useParams();
    let parsan_id;
    if (id !== undefined) {
        parsan_id = parseInt(id, 10);
    } else {
        parsan_id = undefined;
    }

    const [prodajalec, setProdajalec] = useState({});
    const [kupec, setKupec] = useState({});
    const [nakup, setNakup] = useState(initialState);
    const [kartica, setKartica] = useState(podatki_kartice);
    const [errors, setErrors] = useState({ slika: [] });
    const [uporabnikovId, setUporabnikovId] = useState(0)
    const [uporabnikovEmailizOglasa, setUporabnikovEmailizOglasa] = useState("")
    const [errorIzBaze, setErrorIzBaze] = useState(null);
    const [oglas, setOglas] = useState();
    const [nacinPlacila, setNacinPlacila] = useState("");
    const [prevzem, setPrevzem] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user } = UserAuth();

    const navigate = useNavigate();

    useEffect(() => {
        if (user.email) {
            const uporabnikovEmail = user.email;

            api.post('uporabnik/prijavljen-uporabnik', { email: uporabnikovEmail })
                .then(res => {
                    const userId = res.data.userId;
                    setUporabnikovId(userId);
                })
                .catch(err => {
                    if (err.response && err.response.data && err.response.data.error) {
                        setErrorIzBaze(err.response.data.error);
                    } else {
                        setErrorIzBaze("Napaka pri pridobivanju podatkov");
                    }
                });
            api.post('uporabnik/prijavljen-profil', { email: uporabnikovEmail })
                .then(res => {
                    const uporabnik_profil = res.data.user;
                    setKupec(uporabnik_profil);
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }, [user.email]);

    useEffect(() => {
        if (user.email) {
            api.post('uporabnik/prijavljen-profil', { email: uporabnikovEmailizOglasa })
                .then(res => {

                    const uporabnik_profil = res.data.user;
                    setProdajalec(uporabnik_profil);
                })
                .catch(err => {
                    console.error(err);
                });
        }
    }, [uporabnikovEmailizOglasa]);

    useEffect(() => {
        if (parsan_id === undefined) return;
        const oglasId = parsan_id;

        api.post('uporabnik/get-email-from-oglas-id', { id: oglasId })
            .then(res => {
                const uporabnikovEmailizOglasa = res.data.userEmail;
                setUporabnikovEmailizOglasa(uporabnikovEmailizOglasa);
            })
            .catch(err => {
                console.error(err);
                if (err.response && err.response.data && err.response.data.error) {
                    setErrorIzBaze(err.response.data.error);
                } else {
                    setErrorIzBaze("Napaka pri pridobivanju podatkov");
                }
            });
    }, [user.email]);

    useEffect(() => {
        if (parsan_id === undefined) return;
        api.get(`/artikel/${parsan_id}`)
            .then(res => {
                setOglas(res.data);
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

    const nacini_placila = [
        { naziv: 'Nacin placila' },
        { naziv: 'Kreditna kartica' },
        { naziv: 'PayPal' },
        { naziv: 'Po povzetju' }
    ];

    const validateForm = () => {
        let formErrors = {};
        let formIsValid = true;

        const regex = /^[0-9]{3}$/;
        const regex1 = /^(0[1-9]|1[0-2])\/\d{2}$/;

        if (!nakup.nacin_placila || nakup.nacin_placila == "Nacin placila") {
            formIsValid = false;
            formErrors["nacin_placila"] = "Prosimo, izberite nacin placila.";
        }

        if (nakup.nacin_placila === "Kreditna kartica" && !kartica.stevilka) {
            formIsValid = false;
            formErrors["stevilka"] = "Prosimo, vnesite stevilko kartice.";
        }

        if (nakup.nacin_placila === "Kreditna kartica" && !kartica.ime) {
            formIsValid = false;
            formErrors["ime"] = "Prosimo, vnesite ime na kartici.";
        }

        if (nakup.nacin_placila === "Kreditna kartica" && !kartica.datum_poteka) {
            formIsValid = false;
            formErrors["datum_poteka"] = "Prosimo, vnesite datum poteka kartice.";
        }

        if (nakup.nacin_placila === "Kreditna kartica" && !kartica.varnostna_koda) {
            formIsValid = false;
            formErrors["varnostna_koda"] = "Prosimo, vnesite varnostno kodo kartice.";
        }

        if (nakup.nacin_placila === "Kreditna kartica" && (!regex.test(kartica.varnostna_koda) || kartica.varnostna_koda.length != 3)) {
            formIsValid = false;
            formErrors["varnostna_koda"] = "Varnostna koda mora vsebovati natanko tri številke.";
        }

        if (nakup.nacin_placila === "Kreditna kartica" && !regex1.test(kartica.datum_poteka)) {
            formIsValid = false;
            formErrors["datum_poteka"] = "Datum poteka mora biti v obliki MM/LL.";
        }

        setErrors(formErrors);
        return formIsValid;
    }

    const postObvestiloNakupa = () => {
        const obvestilo = {
            fk_uporabnik_id: uporabnikovId,
            fk_oglas_id: oglas.id,
        };

        api.post("obvestilo/dodaj/obvestilo-nakupa", obvestilo, {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setLoading(true);
            setIsSubmitting(true);

            try {
                let prevzem1 = "Dostava na dom";
                if (nakup.osebni_prevzem) {
                    prevzem1 = "Osebni prevzem (" + oglas.lokacija + ")";
                }

                const response = await api.post("/nakup/dodaj", nakup, {
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                });

                if (response.status === 200) {

                    let kupecIme = kupec.ime + " " + kupec.priimek;
                    let prodajalecIme = prodajalec.ime + " " + prodajalec.priimek;
                    let stevilkaRacuna = 'oglas_' + oglas.id;

                    const podatki = {
                        subject: 'Potrdilo nakupa',
                        body: `Potrdilo nakupa.\n\nKupec: ${kupecIme} (${kupec.email})\nProdajalec: ${prodajalecIme} (${prodajalec.email})\nŠtevilka nakupa: oglas_${oglas.id}\nNačin plačila: ${nakup.nacin_placila}\nNacin prevzema: ${prevzem1}`,
                        to: [kupec.email, prodajalec.email],
                    }

                    const pdfDataUri = generatePdf(kupecIme, prodajalecIme, oglas.cena, stevilkaRacuna, oglas.naslov, "", nakup.nacin_placila, prevzem, oglas.lokacija);
                    podatki.pdfDataUri = pdfDataUri;

                    const res = await api.post("/mail/poslji", podatki, {
                        headers: {
                            "Content-Type": "application/json",
                            Accept: "application/json",
                        },
                    });

                    if (res.status === 200) {
                        postObvestiloNakupa();
                        izbris();
                        toast.success(' Uspešno ste opravili nakup!', {
                            position: "top-center",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "colored",
                        });
                    } else {
                        toast.error(' Napaka pri nakupu!', {
                            position: "top-center",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "colored",
                        });
                    }
                }
                setErrors({});
                setTimeout(() => {
                    navigate('/');
                }, 3000);

            } catch (error) {
                console.error("Napaka pri posredovanju zahteve POST", error);
                if (error.response && error.response.data && error.response.data.error) {
                    setErrorIzBaze(error.response.data.error);

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

                }

            }
        }
    };

    const handleChange = (e) => {
        if (e.target.id === 'osebni_prevzem') {
            setPrevzem(!prevzem);
        }

        const { value, name, type, checked } = e.target;
        let valueToUse = value;

        if (type === "checkbox" && name === "osebni_prevzem") {
            valueToUse = checked ? 1 : 0;
        }

        if (name === 'nacin_placila') {
            setNacinPlacila(valueToUse);
        }

        setNakup((prevState) => {
            const nextState = {
                ...prevState,
                [name]: valueToUse,
                fk_uporabnik_id: uporabnikovId,
                fk_oglas_id: parsan_id,
            };
            return nextState;
        });
    };

    const handleKartica = (e) => {
        const { value, name } = e.target;
        let valueToUse = value;

        setKartica((prevState) => {
            const nextState = {
                ...prevState,
                [name]: valueToUse,
            };
            return nextState;
        });
    };

    if (user.email == uporabnikovEmailizOglasa) {
        navigate("/");
    }

    return (
        <>
            {errorIzBaze ? (
                <div className="text-center mt-12">
                    <h3 className="text-4xl font-semibold leading-normal mb-2 text-blueGray-700 mb-2">
                        Prišlo je do napake!
                    </h3>
                    <Link to="/">
                        <button className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded-full shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150" type="button" onClick={izbris()}>
                            Pojdi nazaj
                        </button>
                    </Link>
                </div>

            ) : (
                <div>
                    <IndexNavbar />
                    <br></br>
                    <div className="container mx-auto px-4 pt-20">
                        <div className="flex content-center items-center justify-center h-screen">
                            <div className="w-full lg:w-6/12 px-4">
                                <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white border-0">
                                    <div className="rounded-t mb-0 px-6 py-6">
                                        <div className="text-center mb-3">
                                            <h1 className="text-blueGray-500 font-bold">
                                                Nakup
                                            </h1>
                                        </div>
                                        <hr className="mt-6 border-b-1 border-blueGray-300" />
                                    </div>
                                    <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                                        <form onSubmit={handleSubmit}>
                                            {oglas ? oglas.osebni_prevzem ?
                                                <div className="relative w-full mb-3">
                                                    <div class="w-full"><label class="inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" name="osebni_prevzem" id="osebni_prevzem" value={nakup.osebni_prevzem} onChange={handleChange} class="form-checkbox appearance-none ml-1 w-5 h-5 ease-linear transition-all duration-150 border border-blueGray-300 rounded checked:bg-blueGray-700 checked:border-blueGray-700 focus:border-blueGray-300" />
                                                        <span class="ml-2 text-sm font-semibold text-blueGray-500">Osebni prevzem</span></label></div>
                                                </div> : <></> : "Ni oglasa."
                                            }
                                            <div className="w-1/2 px-2">
                                                <div className="relative w-full mb-3">
                                                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="velikost">
                                                        Nacin placila
                                                    </label>
                                                    <select
                                                        name="nacin_placila"
                                                        id="nacin_placila"
                                                        value={nacinPlacila}
                                                        onChange={handleChange}
                                                        disabled={isSubmitting}
                                                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                                    >
                                                        {nacini_placila.map((v, index) => (
                                                            <option key={index} value={v.naziv}>{v.naziv}</option>
                                                        ))}
                                                    </select>
                                                    <small className="text-red-500">{errors.nacin_placila}</small>
                                                </div>
                                            </div>
                                            <hr className="mt-6 border-b-1 border-blueGray-300" />

                                            {nacinPlacila == "Kreditna kartica" ?
                                                <>
                                                    <div className="text-blueGray-400 text-center mb-3 font-bold">
                                                        <small>Vnesite podatke o kartici</small>
                                                    </div>
                                                    <div className="relative w-full mb-3">
                                                        <label
                                                            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                                            htmlFor="grid-password"
                                                        >
                                                            Številka kartice
                                                        </label>
                                                        <input type="text" placeholder="0000 0000 0000 0000" className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white bg-white rounded text-base shadow outline-none focus:outline-none focus:shadow-outline w-full" ž
                                                            name="stevilka" id="stevilka" value={kartica.stevilka} onChange={handleKartica}
                                                            disabled={isSubmitting}
                                                        />
                                                        <small className="text-red-500">{errors.stevilka}</small>
                                                    </div>
                                                    <div className="relative w-full mb-3">
                                                        <label
                                                            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                                            htmlFor="grid-password"
                                                        >
                                                            Ime na kartici
                                                        </label>
                                                        <input type="text" placeholder="Ime na kartici" className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white bg-white rounded text-base shadow outline-none focus:outline-none focus:shadow-outline w-full" ž
                                                            name="ime" id="ime" value={kartica.ime} onChange={handleKartica}
                                                            disabled={isSubmitting}
                                                        />
                                                        <small className="text-red-500">{errors.ime}</small>
                                                    </div>
                                                    <div className="relative w-full mb-3">
                                                        <label
                                                            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                                            htmlFor="grid-password"
                                                        >
                                                            Datum poteka veljavnosti
                                                        </label>
                                                        <input type="text" placeholder="Datum poteka veljavnosti (MM/LL)" className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white bg-white rounded text-base shadow outline-none focus:outline-none focus:shadow-outline w-full" ž
                                                            name="datum_poteka" id="datum_poteka" value={kartica.datum_poteka} onChange={handleKartica}
                                                            disabled={isSubmitting}
                                                        />
                                                        <small className="text-red-500">{errors.datum_poteka}</small>
                                                    </div>
                                                    <div className="relative w-full mb-3">
                                                        <label
                                                            className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                                            htmlFor="grid-password"
                                                        >
                                                            Varnostna koda
                                                        </label>
                                                        <input type="text" placeholder="Varnostna koda (CVC)" className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 relative bg-white bg-white rounded text-base shadow outline-none focus:outline-none focus:shadow-outline w-full" ž
                                                            name="varnostna_koda" id="varnostna_koda" value={kartica.varnostna_koda} onChange={handleKartica}
                                                            disabled={isSubmitting}
                                                        />
                                                        <small className="text-red-500">{errors.varnostna_koda}</small>
                                                    </div>
                                                </> : <></>
                                            }

                                            {nacinPlacila == "PayPal" ?
                                                "S klikom na KUPI boste preusmerjeni na PayPal za varno dokončanje vašega nakupa" : <></>
                                            }

                                            {nacinPlacila == "Po povzetju" ?
                                                "Plačilo po povzetju" : <></>
                                            }

                                            <br></br>
                                            <div className="text-center mt-6">
                                                <button
                                                    className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
                                                    type="submit"
                                                >
                                                    Kupi
                                                </button>
                                            </div>
                                        </form>
                                        {loading && isSubmitting && (
                                            <div className="flex justify-center">
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    <p style={{ textAlign: "center", marginRight: "10px" }}>Nalaganje...</p>
                                                    <div className="loader"></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <br></br>
                    <Footer />
                </div>
            )}
            <ToastContainer />
        </>
    )
}