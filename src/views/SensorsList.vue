<template>
    <div>
        // ...existing code...
        <table>
            <thead>
                // ...existing code...
            </thead>
            <tbody>
                <tr v-for="sensor in sensors" :key="sensor.id">
                    <td>
                        <router-link :to="{ name: 'SensorDetails', params: { id: sensor.id } }">
                            {{ sensor.id }}
                        </router-link>
                    </td>
                    // ...existing table columns...
                </tr>
            </tbody>
        </table>
    </div>
</template>
