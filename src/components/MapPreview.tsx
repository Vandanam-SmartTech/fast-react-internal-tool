import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import pinPoint from '../assets/google-map-icon-png-13.jpg';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Alert } from '@mui/material';
import { toast } from 'react-toastify';


// Custom red marker
const customMarker = new L.Icon({
  iconUrl: pinPoint,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

type Props = {
  latitude: number;
  longitude: number;
  onLocationChange: (lat: number, lng: number) => void;
};

const MapPreview = ({ latitude, longitude, onLocationChange }: Props) => {
  const [position, setPosition] = useState<[number, number]>([latitude, longitude]);
  const markerRef = useRef<L.Marker>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingLatLng, setPendingLatLng] = useState<[number, number] | null>(null);


  useEffect(() => {
    setPosition([latitude, longitude]);
  }, [latitude, longitude]);

  const handleDragEnd = () => {
    const marker = markerRef.current;
    if (marker) {
      const { lat, lng } = marker.getLatLng();
      setPendingLatLng([lat, lng]);
      setDialogOpen(true);
    }
  };

  const handleConfirmLocationChange = () => {
    if (pendingLatLng) {
      const [lat, lng] = pendingLatLng;
      setPosition([lat, lng]);
      onLocationChange(lat, lng);
      toast.success("Location updated successfully!", {
        autoClose: 1000,
        hideProgressBar: true,
      });
    }
    setDialogOpen(false);
  };

  const handleCancelLocationChange = () => {
    // Revert marker to original position
    if (markerRef.current && pendingLatLng) {
      markerRef.current.setLatLng(position);
    }
    setDialogOpen(false);
    setPendingLatLng(null);
  };




  return (
    <MapContainer
      center={position}
      zoom={15}
      scrollWheelZoom={true}
      style={{ height: '500px', width: '100%', borderRadius: '0.5rem' }}
    // whenCreated={(map) => {
    //   map.flyTo(position, 18, { duration: 1.5 });
    // }}
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      //attribution='&copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
      />

      <Marker
        position={position}
        icon={customMarker}
        draggable={true}
        eventHandlers={{ dragend: handleDragEnd }}
        ref={markerRef}
      >
        <Popup>
          Selected Location<br />
          Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
        </Popup>
      </Marker>

      <Dialog
        open={dialogOpen}
        onClose={handleCancelLocationChange}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle id="alert-dialog-title">Confirm</DialogTitle>
        <DialogContent dividers>
          <Alert severity="info">Do you want to change the location?</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelLocationChange}>No</Button>
          <Button onClick={handleConfirmLocationChange} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>


    </MapContainer>


  );
};

export default MapPreview;
