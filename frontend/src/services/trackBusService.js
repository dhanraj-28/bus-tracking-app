

import { db } from "../config/firebase";

import {

  collection,

  doc,

  getDoc,

  getDocs,

} from "firebase/firestore";

import { extractStoppingsFromRoute } from "../utils/routeStops";



const ROUTES_COLLECTION = "Routes";

const STOPPING_SUBCOLLECTIONS = ["stoppings", "stops", "Stoppings", "stopping"];



export const getAllRoutesService = async () => {

  try {

    const routesRef = collection(db, ROUTES_COLLECTION);

    const snapshot = await getDocs(routesRef);

    const routes = [];



    snapshot.forEach((routeDoc) => {

      routes.push({

        ...routeDoc.data(),

        routeId: routeDoc.id,

        id: routeDoc.id,

      });

    });



    return routes;

  } catch (error) {

    console.log("Service Error:", error);

    throw error;

  }

};



export const getRouteByIdService = async (routeId) => {

  try {

    if (!routeId) {

      return null;

    }



    const routeRef = doc(db, ROUTES_COLLECTION, String(routeId));

    const snapshot = await getDoc(routeRef);



    if (!snapshot.exists()) {

      console.log("[Stoppings] Document not found:", routeId);

      return null;

    }



    return {

      ...snapshot.data(),

      routeId: snapshot.id,

      id: snapshot.id,

    };

  } catch (error) {

    console.log("Service Error:", error);

    throw error;

  }

};



const fetchStoppingsFromSubcollections = async (routeId) => {

  for (const subName of STOPPING_SUBCOLLECTIONS) {

    const stoppingsRef = collection(

      db,

      ROUTES_COLLECTION,

      String(routeId),

      subName

    );

    const snapshot = await getDocs(stoppingsRef);



    if (snapshot.empty) continue;



    const items = [];

    snapshot.forEach((stopDoc) => {

      items.push({ id: stopDoc.id, ...stopDoc.data() });

    });



    const normalized = extractStoppingsFromRoute({ stoppings: items });

    if (normalized.length > 0) {

      return normalized;

    }

  }



  return [];

};



export const getStoppingsByRouteIdService = async (routeId) => {

  const route = await getRouteByIdService(routeId);



  if (!route) {

    return { route: null, stoppings: [] };

  }



  console.log("[Stoppings] Fetched route:", routeId, "keys:", Object.keys(route));



  let stoppings = extractStoppingsFromRoute(route);



  if (stoppings.length > 0) {

    console.log("[Stoppings] Found", stoppings.length, "from document fields");

    return { route, stoppings };

  }



  stoppings = await fetchStoppingsFromSubcollections(routeId);



  if (stoppings.length > 0) {

    console.log("[Stoppings] Found", stoppings.length, "from subcollection");

    return { route, stoppings };

  }



  console.log("[Stoppings] No stoppings for route:", routeId);

  return { route, stoppings: [] };

};



export const searchBusesService = async (searchText) => {

  try {

    const routesRef = collection(db, ROUTES_COLLECTION);



    const snapshot = await getDocs(routesRef);



    const busList = [];



    snapshot.forEach((routeDoc) => {

      const data = routeDoc.data();



      const query = searchText.toLowerCase();



      if (

        data.busNumber?.toLowerCase().includes(query) ||

        data.busName?.toLowerCase().includes(query) ||

        data.routeName?.toLowerCase().includes(query)

      ) {

        busList.push({

          ...data,

          id: routeDoc.id,

          routeId: routeDoc.id,

        });

      }

    });



    return {

      success: true,

      data: busList,

    };



  } catch (error) {

    console.log("Service Error:", error);



    return {

      success: false,

      message: error.message,

    };

  }

};




