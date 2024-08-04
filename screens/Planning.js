import { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Button, SectionList, TouchableOpacity, Modal, TextInput, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { API_URL } from '../config';

export default function Planning({ navigation }) {
  const [vols, setVols] = useState([]);
  const [selectedVol, setSelectedVol] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newVol, setNewVol] = useState({ numOperation: '', type: '', état: 'prévue', compagnie: '', typeAvion: '', heurePrévue: '', heureEffective: null, piste_id: null });
  const [pistes, setPistes] = useState([]);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const scrollViewRef = useRef(null);

  const fetchPiste = async (piste_id) => {
    try {
      const res = await axios.get(`${API_URL}/piste/${piste_id}`);
      return res.data.numéroPiste;
    } catch (err) {
      console.log('Error fetching piste:', err);
      return null;
    }
  };

  const fetchPistes = async () => {
    try {
      const res = await axios.get(`${API_URL}/piste`);
      setPistes(res.data);
    } catch (err) {
      console.log('Error fetching pistes:', err);
    }
  };

  const fetchVols = async () => {
    try {
      const res = await axios.get(`${API_URL}/vol`);
      if (!Array.isArray(res.data)) {
        console.error('Response data is not an array');
        return;
      }

      const validVols = res.data.filter(vol => vol && vol.état !== undefined);
      const filteredVols = validVols.filter(vol => vol.état === 'prévue');

      const volsWithPiste = await Promise.all(filteredVols.map(async (vol) => {
        const numéroPiste = await fetchPiste(vol.piste_id);
        return { ...vol, numéroPiste };
      }));

      setVols(volsWithPiste);
    } catch (err) {
      console.log('Error fetching vols:', err);
    }
  };

  useEffect(() => {
    fetchPistes();
    fetchVols();
  }, []);

  const handleAddVol = async () => {
    try {
      const res = await axios.post(`${API_URL}/vol`, newVol);
      await fetchVols();
      setModalVisible(false);
      setNewVol({ numOperation: '', type: '', état: 'prévue', compagnie: '', typeAvion: '', heurePrévue: '', heureEffective: null, piste_id: null });
    } catch (err) {
      console.log('Error:', err);
    }
  };

  const handleEditVol = async () => {
    if (!selectedVol) return;
    try {
      const res = await axios.put(`${API_URL}/vol/${selectedVol.idOperation}`, {
        ...selectedVol,
        état: selectedVol.état,
      });
      await fetchVols();
      setModalVisible(false);
      setSelectedVol(null);
      setIsEditing(false);
    } catch (err) {
      console.log('Error:', err);
    }
  };

  const handleDeleteVol = async () => {
    if (!selectedVol) return;
    try {
      await axios.delete(`${API_URL}/vol/${selectedVol.idOperation}`);
      await fetchVols();
      setConfirmDeleteVisible(false);
      setSelectedVol(null);
    } catch (err) {
      console.log('Error:', err);
    }
  };

  const handleRowPress = (item) => {
    setSelectedVol(item);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setSelectedVol(null);
  };

  const handleCancelDelete = () => {
    setConfirmDeleteVisible(false);
    setSelectedVol(null);
  };

  const handleStatusChange = async () => {
    if (!selectedVol) return;
    try {
      const updatedVol = {
        ...selectedVol,
        état: newStatus,
        heureEffective: newStatus === 'effectuée' ? new Date(new Date().getTime() + 3 * 60 * 60 * 1000).toISOString() : null, // Set current date in GMT+3 if status is 'effectuée'
      };
      await axios.put(`${API_URL}/vol/${selectedVol.idOperation}`, updatedVol);
      await fetchVols();
      setStatusModalVisible(false);
      setSelectedVol(null);
    } catch (err) {
      console.log('Error:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.row, selectedVol?.numOperation === item.numOperation && styles.selectedRow]}
      onPress={() => handleRowPress(item)}
    >
      <Text style={[styles.cell, { width: 100 }]}>{item.numOperation ? item.numOperation : null}</Text>
      <Text style={[styles.cell, { width: 120 }]}>{item.type ? item.type : null}</Text>
      <Text style={[styles.cell, { width: 180 }]}>{item.compagnie ? item.compagnie : null}</Text>
      <Text style={[styles.cell, { width: 120 }]}>{item.typeAvion ? item.typeAvion : null}</Text>
      <Text style={[styles.cell, { width: 120 }]}>{formatDate(item.heurePrévue) ? formatDate(item.heurePrévue) : null}</Text>
      <Text style={[styles.cell, { width: 100 }]}>{item.numéroPiste ? item.numéroPiste : null}</Text>
      <TouchableOpacity onPress={() => {
        setSelectedVol(item);
        setNewStatus(item.état === 'effectuée' ? 'annulée' : 'effectuée');
        setStatusModalVisible(true);
      }}>
        <Text style={[styles.cell, { width: 100 }]}>{item.état ? item.état : 'Inconnu'}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={() => setSelectedVol(null)}>
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.addButton, styles.addButtonColor]} onPress={() => {
            setIsEditing(false);
            setModalVisible(true);
          }}>
            <Text style={styles.addButtonText}>Ajouter</Text>
          </TouchableOpacity>
          {selectedVol && (
            <>
              <TouchableOpacity style={[styles.addButton, styles.editButton]} onPress={() => {
                setIsEditing(true);
                setModalVisible(true);
              }}>
                <Text style={styles.addButtonText}>Modifier</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.addButton, styles.deleteButton]} onPress={() => setConfirmDeleteVisible(true)}>
                <Text style={styles.addButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        <ScrollView horizontal ref={scrollViewRef}>
          <View>
            <View style={styles.header}>
              <Text style={[styles.headerText, { width: 100 }]}>Numéro</Text>
              <Text style={[styles.headerText, { width: 120 }]}>Type</Text>
              <Text style={[styles.headerText, { width: 180 }]}>Compagnie</Text>
              <Text style={[styles.headerText, { width: 120 }]}>Type Avion</Text>
              <Text style={[styles.headerText, { width: 120 }]}>Heure Prévue</Text>
              <Text style={[styles.headerText, { width: 100 }]}>Numéro Piste</Text>
              <Text style={[styles.headerText, { width: 100 }]}>État</Text>
            </View>
            <SectionList
              sections={[{ title: '', data: vols }]}
              keyExtractor={item => item.numOperation}
              renderItem={renderItem}
              stickySectionHeadersEnabled={false}
            />
          </View>
        </ScrollView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={handleCancel}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{isEditing ? 'Modifier le Vol' : 'Ajouter un Vol'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Numéro de Vol"
              value={isEditing ? selectedVol?.numOperation : newVol.numOperation}
              onChangeText={(text) => isEditing ? setSelectedVol({ ...selectedVol, numOperation: text }) : setNewVol({ ...newVol, numOperation: text })}
            />
            <Picker
              selectedValue={isEditing ? selectedVol?.type : newVol.type}
              style={styles.input}
              onValueChange={(itemValue) => isEditing ? setSelectedVol({ ...selectedVol, type: itemValue }) : setNewVol({ ...newVol, type: itemValue })}
            >
              <Picker.Item label="Type" value={null} />
              <Picker.Item label="Atterrissage" value="atterrissage" />
              <Picker.Item label="Décollage" value="décollage" />
            </Picker>
            <TextInput
              style={styles.input}
              placeholder="Compagnie"
              value={isEditing ? selectedVol?.compagnie : newVol.compagnie}
              onChangeText={(text) => isEditing ? setSelectedVol({ ...selectedVol, compagnie: text }) : setNewVol({ ...newVol, compagnie: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Type Avion"
              value={isEditing ? selectedVol?.typeAvion : newVol.typeAvion}
              onChangeText={(text) => isEditing ? setSelectedVol({ ...selectedVol, typeAvion: text }) : setNewVol({ ...newVol, typeAvion: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="yyyy-mm-ddThh:mm:ss"
              value={isEditing ? selectedVol?.heurePrévue : newVol.heurePrévue}
              onChangeText={(text) => isEditing ? setSelectedVol({ ...selectedVol, heurePrévue: text }) : setNewVol({ ...newVol, heurePrévue: text })}
            />
            <Picker
              selectedValue={isEditing ? selectedVol?.piste_id : newVol.piste_id}
              style={styles.input}
              onValueChange={(itemValue) => isEditing ? setSelectedVol({ ...selectedVol, piste_id: itemValue }) : setNewVol({ ...newVol, piste_id: itemValue })}
            >
              <Picker.Item label="Numéro de piste" value={null} />
              {pistes.map((piste) => (
                <Picker.Item key={piste.idPiste} label={piste.numéroPiste} value={piste.idPiste} />
              ))}
            </Picker>
            <Button title={isEditing ? "Modifier" : "Ajouter"} onPress={isEditing ? handleEditVol : handleAddVol} color="#4CAF50" />
            <View style={styles.buttonSpacing} />
            <Button title="Annuler" onPress={handleCancel} color="#FF6347" />
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={confirmDeleteVisible}
          onRequestClose={handleCancelDelete}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Êtes-vous sûr de vouloir supprimer ce vol ?</Text>
            <View style={styles.buttonSpacing} />
            <Button title="Confirmer" onPress={handleDeleteVol} color="#FF6347" />
            <View style={styles.buttonSpacing} />
            <Button title="Annuler" onPress={handleCancelDelete} color="#4CAF50" />
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={statusModalVisible}
          onRequestClose={() => {
            setStatusModalVisible(false);
            setSelectedVol(null);
          }}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Changer l'état du vol</Text>
            <Picker
              selectedValue={newStatus}
              style={styles.input}
              onValueChange={(itemValue) => setNewStatus(itemValue)}
            >
              <Picker.Item label="Sélectionnez un état" value="" />
              <Picker.Item label="Effectuée" value="effectuée" />
              <Picker.Item label="Annulée" value="annulée" />
            </Picker>
            <Button title="Confirmer" onPress={handleStatusChange} color="#4CAF50" />
            <View style={styles.buttonSpacing} />
            <Button title="Annuler" onPress={() => {
              setStatusModalVisible(false);
              setSelectedVol(null);
            }} color="#FF6347" />
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginRight: 10,
  },
  addButtonColor: {
    backgroundColor: '#4CAF50',
  },
  editButton: {
    backgroundColor: 'orange',
  },
  deleteButton: {
    backgroundColor: 'red',
  },
  addButtonText: {
    color: 'white',
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
  sectionTitle: {
    fontSize: 14,
    marginVertical: 10,
  },
  row: {  
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
    marginHorizontal: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderRadius: 3,
    paddingVertical: 6,
    backgroundColor: "#fff",
    paddingHorizontal: 6,
  },
  selectedRow: {
    backgroundColor: '#e0e0e0',
  },
  cell: {
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  buttonSpacing: {
    height: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: '100%',
  }
});