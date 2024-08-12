import { View, Text, SectionList, StyleSheet, ScrollView } from "react-native";
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../config';

export default function Historique({ navigation }) {
    const [vols, setVols] = useState([]);

    const fetchVols = async () => {
        try {
            const res = await axios.get(`${API_URL}/vol`);
            if (!Array.isArray(res.data)) {
                console.error('Response data is not an array');
                return;
            }
            const filteredVols = res.data.filter(vol => vol.état !== 'prévue');
            setVols(filteredVols);
        } catch (err) {
            console.log('Error fetching vols:', err);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchVols();
        }, [])
    );

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const renderItem = ({ item }) => (
        <View style={styles.row}>
            <Text style={[styles.cell, { width: 100 }]}>{item.numOperation}</Text>
            <Text style={[styles.cell, { width: 120 }]}>{item.type}</Text>
            <Text style={[styles.cell, { width: 180 }]}>{item.compagnie}</Text>
            <Text style={[styles.cell, { width: 120 }]}>{item.typeAvion}</Text>
            <Text style={[styles.cell, { width: 120 }]}>{formatDate(item.heurePrévue)}</Text>
            <Text style={[styles.cell, { width: 120 }]}>{item.heureEffective ? formatDate(item.heureEffective) : ''}</Text>
            <Text style={[styles.cell, { width: 120 }]}>{item.état}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView horizontal>
                <View>
                    <View style={styles.header}>
                        <Text style={[styles.headerText, { width: 100 }]}>Numéro</Text>
                        <Text style={[styles.headerText, { width: 120 }]}>Type</Text>
                        <Text style={[styles.headerText, { width: 180 }]}>Compagnie</Text>
                        <Text style={[styles.headerText, { width: 120 }]}>Type Avion</Text>
                        <Text style={[styles.headerText, { width: 120 }]}>Date Prévue</Text>
                        <Text style={[styles.headerText, { width: 120 }]}>Date Effective</Text>
                        <Text style={[styles.headerText, { width: 120 }]}>Etat</Text>
                    </View>
                    <SectionList
                        sections={[{ title: '', data: vols }]}
                        keyExtractor={item => item.numOperation}
                        renderItem={renderItem}
                        stickySectionHeadersEnabled={false}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingVertical: 6,
        backgroundColor: "#fff",
        paddingHorizontal: 6,
    },
    cell: {
        fontSize: 14,
        flex: 1,
        textAlign: 'center',
    },
    header: {
        flexDirection: 'row',
        paddingVertical: 10,
        backgroundColor: "#4981de",
    },
    headerText: {
        fontSize: 15,
        flex: 1,
        textAlign: 'center',
        color: 'white',
        fontWeight: 'bold',
    },
});