import { createRouter, createWebHashHistory } from "vue-router";
import MyApp from "@/components/my-app.vue";
import SensorDetails from "@/components/sensor-details.vue";

const routes = [
    {
        path: "/",
        name: "home",
        component: MyApp
    },
    {
        path: "/sensor/:id",
        name: "sensorDetails",
        component: SensorDetails,
        props: true
    }
];

const router = createRouter({
    history: createWebHashHistory(),
    routes
});

// Add navigation guard for debugging (optional)
router.beforeEach((to, from, next) => {
    console.log("Route change:", { from: from.path, to: to.path });
    next();
});

export default router;
