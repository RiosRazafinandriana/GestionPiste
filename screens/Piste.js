import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button, SectionList, TouchableOpacity, Modal, TextInput, TouchableWithoutFeedback } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';

export default function Piste({ navigation }) {
  const [pistes, setPiste] = useState([]);
  const [selectedPiste, setSelectedPiste] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false); // Modal pour modifier
  const [confirmDeleteModalVisible, setConfirmDeleteModalVisible] = useState(false); // Modal de confirmation de suppression
  const [newPiste, setNewPiste] = useState({ numéroPiste: '', longueur: '', largeur: '', état: 'disponible' });

  const fetchAllPiste = async () => {
    try {
      const res = await axios.get(`${API_URL}/piste`);
      setPiste(res.data);
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchAllPiste();
  }, []);

  const handleEtatChange = async (piste, newEtat) => {
    try {
      console.log('Sending data:', {
        ...piste,
        état: newEtat,
      });
      const res = await axios.put(`${API_URL}/piste/${piste.idPiste}`, {
        ...piste,
        état: newEtat,
      });
      await fetchAllPiste();
      setModalVisible(false);
      setSelectedPiste(null); // Désélectionner la ligne après le changement d'état
    } catch (err) {
      console.log('Error:', err);
    }
  };

  const handleAddPiste = async () => {
    try {
      console.log('Adding new piste:', newPiste);
      const res = await axios.post(`${API_URL}/piste`, newPiste);
      await fetchAllPiste();
      setAddModalVisible(false);
      setNewPiste({ numéroPiste: '', longueur: '', largeur: '', état: 'disponible' });
    } catch (err) {
      console.log('Error:', err);
    }
  };

  const handleEditPiste = async () => {
    if (!selectedPiste) return;
    try {
      console.log('Editing piste:', selectedPiste);
      const res = await axios.put(`${API_URL}/piste/${selectedPiste.idPiste}`, {
        ...selectedPiste,
        état: selectedPiste.état, // Garder l'état inchangé
      });
      await fetchAllPiste();
      setEditModalVisible(false);
      setSelectedPiste(null);
    } catch (err) {
      console.log('Error:', err);
    }
  };

  const handleDeletePiste = async () => {
    if (!selectedPiste) return;
    try {
      console.log('Deleting piste:', selectedPiste);
      await axios.delete(`${API_URL}/piste/${selectedPiste.idPiste}`);
      await fetchAllPiste();
      setSelectedPiste(null);
      setConfirmDeleteModalVisible(false); // Fermer le modal de confirmation
    } catch (err) {
      console.log('Error:', err);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.row, selectedPiste?.numéroPiste === item.numéroPiste && styles.selectedRow]}
      onLongPress={() => {
        console.log('Selected piste:', item); 
        setSelectedPiste(item); 
      }} 
      delayLongPress={5} 
    >
      <Text style={[styles.cell, { width: 70 }]}>{item.numéroPiste}</Text>
      <Text style={[styles.cell, { width: 150 }]}>{item.longueur} x {item.largeur}</Text>
      <TouchableOpacity 
        style={[styles.cell, { width: 100 }]} 
        onPress={() => { 
          setModalVisible(true); 
          setSelectedPiste(item); // Set selectedPiste for modal
        }}
      >
        <Text>{item.état}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const sections = [
    { title: 'Pistes Disponibles', data: pistes.filter(piste => piste.état === 'disponible') },
    { title: 'Pistes en Maintenance', data: pistes.filter(piste => piste.état === 'en maintenance') },
  ];

  return (
    <TouchableWithoutFeedback onPress={() => setSelectedPiste(null)}>
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
            <Text style={styles.addButtonText}>Ajouter</Text>
          </TouchableOpacity>
          {selectedPiste && ( // Afficher le bouton Modifier seulement si une piste est sélectionnée
            <TouchableOpacity style={styles.editButton} onPress={() => setEditModalVisible(true)}>
              <Text style={styles.editButtonText}>Modifier</Text>
            </TouchableOpacity>
          )}
          {selectedPiste && ( // Afficher le bouton Supprimer seulement si une piste est sélectionnée
            <TouchableOpacity style={styles.deleteButton} onPress={() => setConfirmDeleteModalVisible(true)}>
              <Text style={styles.deleteButtonText}>Supprimer</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.header}>
          <Text style={[styles.headerText, { width: 70 }]}>Numéro</Text>
          <Text style={[styles.headerText, { width: 150 }]}>Dimensions</Text>
          <Text style={[styles.headerText, { width: 100 }]}>Etat</Text>
        </View>
        <SectionList
          sections={sections}
          keyExtractor={item => item.numéroPiste}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionTitle}>{title}</Text>
          )}
        />
        
        {/* Modal de confirmation de suppression */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={confirmDeleteModalVisible}
          onRequestClose={() => setConfirmDeleteModalVisible(false)}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Voulez-vous vraiment supprimer cette ligne ?</Text>
            <View style={styles.buttonSpacing} />
            <Button title="Confirmer" onPress={handleDeletePiste} color="#FF6347" />
            <Button title="Annuler" onPress={() => { setConfirmDeleteModalVisible(false); setSelectedPiste(null); }} color="#4CAF50" />
          </View>
        </Modal>

        {/* Modal pour changer l'état */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
            setSelectedPiste(null); // Reset selectedPiste when modal is closed
          }}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Changer l'état de la piste</Text>
            {selectedPiste && selectedPiste.état === 'disponible' && (
              <Button title="En Maintenance" onPress={() => handleEtatChange(selectedPiste, 'en maintenance')} color="#f194ff" />
            )}
            {selectedPiste && selectedPiste.état === 'en maintenance' && (
              <Button title="Disponible" onPress={() => handleEtatChange(selectedPiste, 'disponible')} color="#4CAF50" />
            )}
            <Button title="Annuler" onPress={() => { setModalVisible(false); setSelectedPiste(null); }} color="#FF6347" />
          </View>
        </Modal>

        {/* Modal pour ajouter une nouvelle piste */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={addModalVisible}
          onRequestClose={() => {
            setAddModalVisible(!addModalVisible);
          }}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Ajouter une nouvelle piste</Text>
            <TextInput
              style={styles.input}
              placeholder="Numéro de piste"
              value={newPiste.numéroPiste}
              onChangeText={(text) => setNewPiste({ ...newPiste, numéroPiste: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Longueur"
              value={newPiste.longueur.toString()} // Convertir en chaîne
              onChangeText={(text) => {
                const value = parseFloat(text);
                setNewPiste({ ...newPiste, longueur: isNaN(value) ? '' : value });
              }}
            />
            <TextInput
              style={styles.input}
              placeholder="Largeur"
              value={newPiste.largeur.toString()} // Convertir en chaîne
              onChangeText={(text) => {
                const value = parseFloat(text);
                setNewPiste({ ...newPiste, largeur: isNaN(value) ? '' : value });
              }}
            />
            <Button title="Ajouter" onPress={handleAddPiste} color="#4CAF50" />
            <View style={styles.buttonSpacing} />
            <Button title="Annuler" onPress={() => setAddModalVisible(false)} color="#FF6347" />
          </View>
        </Modal>

        {/* Modal pour modifier une piste */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={editModalVisible} // Assurez-vous que le modal est visible
          onRequestClose={() => {
            setEditModalVisible(false);
            setSelectedPiste(null); // Reset selectedPiste when modal is closed
          }}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Modifier la piste</Text>
            <TextInput
              style={styles.input}
              placeholder="Numéro de piste"
              value={selectedPiste?.numéroPiste || ''} // Précharger la valeur
              onChangeText={(text) => setSelectedPiste({ ...selectedPiste, numéroPiste: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Longueur"
              value={selectedPiste?.longueur?.toString() || ''} // Convertir en chaîne
              onChangeText={(text) => {
                const value = parseFloat(text);
                setSelectedPiste({ ...selectedPiste, longueur: isNaN(value) ? '' : value }); // Convertir en nombre
              }}
            />
            <TextInput
              style={styles.input}
              placeholder="Largeur"
              value={selectedPiste?.largeur?.toString() || ''} // Convertir en chaîne
              onChangeText={(text) => {
                const value = parseFloat(text);
                setSelectedPiste({ ...selectedPiste, largeur: isNaN(value) ? '' : value }); // Convertir en nombre
              }}
            />
            <Button title="Modifier" onPress={handleEditPiste} color="#4CAF50" />
            <View style={styles.buttonSpacing} />
            <Button title="Annuler" onPress={() => { setEditModalVisible(false); setSelectedPiste(null); }} color="#FF6347" />
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
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
  },
  editButton: {
    backgroundColor: '#FFA500', // Couleur pour le bouton Modifier
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 5,
    marginLeft: 10,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
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