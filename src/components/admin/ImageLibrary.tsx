import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import ImageCropper from './ImageCropper';
import './ImageLibrary.css';

interface SlideshowImage {
  id: string;
  url: string;
  name: string;
  createdAt: any;
}

interface InventoryImage {
  url: string;
  name?: string;
  updatedAt?: any;
}

interface ProcessImage {
  id: string;
  url: string;
  name: string;
  processStep: string;
  uploadedAt: any;
}

const ImageLibrary = () => {
  const { currentUser } = useAuth();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const PROCESS_STEPS = [
    { id: 'design-consultation', label: 'Step 1: Design Consultation' },
    { id: 'precision-measuring', label: 'Step 2: Precision Measuring' },
    { id: 'slab-selection', label: 'Step 3: Slab Selection & Grain Matching' },
    { id: 'cnc-fabrication', label: 'Step 4: CNC Fabrication' },
    { id: 'quality-inspection', label: 'Step 5: Quality Inspection' },
    { id: 'professional-installation', label: 'Step 6: Professional Installation' },
  ];

  // Equipment images
  const [horusImage, setHorusImage] = useState<InventoryImage | null>(null);
  const [horusImageUrl, setHorusImageUrl] = useState('');
  const [horusImageName, setHorusImageName] = useState('');
  const [horusImageFile, setHorusImageFile] = useState<File | null>(null);
  const [loadingHorusImage, setLoadingHorusImage] = useState(true);
  const [savingHorusImage, setSavingHorusImage] = useState(false);

  const [sassoImage, setSassoImage] = useState<InventoryImage | null>(null);
  const [sassoImageUrl, setSassoImageUrl] = useState('');
  const [sassoImageName, setSassoImageName] = useState('');
  const [sassoImageFile, setSassoImageFile] = useState<File | null>(null);
  const [loadingSassoImage, setLoadingSassoImage] = useState(true);
  const [savingSassoImage, setSavingSassoImage] = useState(false);

  // Process step images
  const [processImages, setProcessImages] = useState<ProcessImage[]>([]);
  const [loadingProcessImages, setLoadingProcessImages] = useState(true);
  const [newProcessImageUrl, setNewProcessImageUrl] = useState('');
  const [newProcessImageName, setNewProcessImageName] = useState('');
  const [newProcessImageFile, setNewProcessImageFile] = useState<File | null>(null);
  const [selectedProcessStep, setSelectedProcessStep] = useState<string>('design-consultation');
  const [uploadingProcessImage, setUploadingProcessImage] = useState(false);

  // Home page slideshow images
  const [homeSlides, setHomeSlides] = useState<SlideshowImage[]>([]);
  const [loadingHomeSlides, setLoadingHomeSlides] = useState(true);
  const [newHomeSlideUrl, setNewHomeSlideUrl] = useState('');
  const [newHomeSlideName, setNewHomeSlideName] = useState('');
  const [newHomeSlideFile, setNewHomeSlideFile] = useState<File | null>(null);
  const [uploadingHomeSlide, setUploadingHomeSlide] = useState(false);

  const [inventoryImage, setInventoryImage] = useState<InventoryImage | null>(null);
  const [inventoryImageUrl, setInventoryImageUrl] = useState('');
  const [inventoryImageName, setInventoryImageName] = useState('');
  const [inventoryImageFile, setInventoryImageFile] = useState<File | null>(null);
  const [loadingInventoryImage, setLoadingInventoryImage] = useState(true);
  const [savingInventoryImage, setSavingInventoryImage] = useState(false);

  // Homepage image (single hero image)
  const [homepageImage, setHomepageImage] = useState<InventoryImage | null>(null);
  const [homepageImageUrl, setHomepageImageUrl] = useState('');
  const [homepageImageName, setHomepageImageName] = useState('');
  const [homepageImageFile, setHomepageImageFile] = useState<File | null>(null);
  const [loadingHomepageImage, setLoadingHomepageImage] = useState(true);
  const [savingHomepageImage, setSavingHomepageImage] = useState(false);

  // Dropdown state for section navigation
  const [selectedSection, setSelectedSection] = useState<string>('homepage-slideshow');

  // Image cropper state
  const [cropperFile, setCropperFile] = useState<File | null>(null);
  const [cropperCallback, setCropperCallback] = useState<((file: File) => void) | null>(null);
  const [cropperAspectRatio, setCropperAspectRatio] = useState<number | undefined>(undefined);

  // Helper function to handle file selection with cropper
  const handleFileSelect = (file: File | null, callback: (file: File) => void, aspectRatio?: number) => {
    if (file) {
      setCropperFile(file);
      setCropperCallback(() => callback);
      setCropperAspectRatio(aspectRatio);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    if (cropperCallback) {
      cropperCallback(croppedFile);
    }
    setCropperFile(null);
    setCropperCallback(null);
    setCropperAspectRatio(undefined);
  };

  const handleCropCancel = () => {
    setCropperFile(null);
    setCropperCallback(null);
    setCropperAspectRatio(undefined);
  };

  useEffect(() => {
    fetchHomeSlideshowImages();
    fetchInventoryImage();
    fetchHorusImage();
    fetchSassoImage();
    fetchProcessImages();
    fetchHomepageImage();
  }, []);

  // Scroll to section when dropdown changes
  useEffect(() => {
    if (selectedSection) {
      const element = document.getElementById(`section-${selectedSection}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [selectedSection]);

  const fetchHorusImage = async () => {
    try {
      const horusDoc = await getDocs(collection(db, 'horusImage'));
      if (!horusDoc.empty) {
        const docSnap = horusDoc.docs[0];
        const data = docSnap.data() as InventoryImage;
        setHorusImage(data);
        setHorusImageUrl(data.url || '');
        setHorusImageName(data.name || '');
      } else {
        setHorusImage(null);
        setHorusImageUrl('');
        setHorusImageName('');
      }
    } catch (error) {
      console.error('Error fetching Horus image:', error);
    } finally {
      setLoadingHorusImage(false);
    }
  };

  const fetchSassoImage = async () => {
    try {
      const sassoDoc = await getDocs(collection(db, 'sassoImage'));
      if (!sassoDoc.empty) {
        const docSnap = sassoDoc.docs[0];
        const data = docSnap.data() as InventoryImage;
        setSassoImage(data);
        setSassoImageUrl(data.url || '');
        setSassoImageName(data.name || '');
      } else {
        setSassoImage(null);
        setSassoImageUrl('');
        setSassoImageName('');
      }
    } catch (error) {
      console.error('Error fetching Sasso image:', error);
    } finally {
      setLoadingSassoImage(false);
    }
  };

  const fetchProcessImages = async () => {
    try {
      const imagesRef = collection(db, 'processImages');
      const imagesQuery = query(imagesRef, orderBy('uploadedAt', 'desc'));
      const querySnapshot = await getDocs(imagesQuery);
      
      const imagesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ProcessImage[];

      setProcessImages(imagesData);
    } catch (error) {
      console.error('Error fetching process images:', error);
    } finally {
      setLoadingProcessImages(false);
    }
  };

  const fetchHomeSlideshowImages = async () => {
    setLoadingHomeSlides(true);
    try {
      const slidesRef = collection(db, 'homeSlideshowImages');
      const slidesQuery = query(slidesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(slidesQuery);
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as any),
      })) as SlideshowImage[];
      setHomeSlides(items);
    } catch (error) {
      console.error('Error fetching home slideshow images:', error);
    } finally {
      setLoadingHomeSlides(false);
    }
  };


  const fetchInventoryImage = async () => {
    try {
      const inventoryDoc = await getDocs(collection(db, 'inventoryImage'));
      // Use the first doc if any exist
      if (!inventoryDoc.empty) {
        const docSnap = inventoryDoc.docs[0];
        const data = docSnap.data() as InventoryImage;
        setInventoryImage(data);
        setInventoryImageUrl(data.url || '');
        setInventoryImageName(data.name || '');
      } else {
        setInventoryImage(null);
        setInventoryImageUrl('');
        setInventoryImageName('');
      }
    } catch (error) {
      console.error('Error fetching inventory image:', error);
    } finally {
      setLoadingInventoryImage(false);
    }
  };

  const fetchHomepageImage = async () => {
    try {
      const homepageDoc = await getDocs(collection(db, 'homepageImage'));
      if (!homepageDoc.empty) {
        const docSnap = homepageDoc.docs[0];
        const data = docSnap.data() as InventoryImage;
        setHomepageImage(data);
        setHomepageImageUrl(data.url || '');
        setHomepageImageName(data.name || '');
      } else {
        setHomepageImage(null);
        setHomepageImageUrl('');
        setHomepageImageName('');
      }
    } catch (error) {
      console.error('Error fetching homepage image:', error);
    } finally {
      setLoadingHomepageImage(false);
    }
  };

  // Helper function to upload file to Firebase Storage
  const uploadFileToStorage = async (file: File, folder: string): Promise<string> => {
    if (!currentUser) {
      throw new Error('You must be logged in to upload files');
    }
    
    const timestamp = Date.now();
    // Sanitize filename - remove spaces and special characters
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${folder}/${timestamp}-${sanitizedName}`;
    const storageRef = ref(storage, fileName);
    
    try {
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error: any) {
      console.error('Upload error details:', error);
      if (error.code === 'storage/unauthorized') {
        throw new Error('You are not authorized to upload files. Please make sure you are logged in.');
      } else if (error.code === 'storage/unknown') {
        throw new Error('Upload failed. Please check that CORS is configured in Firebase Storage and try again.');
      }
      throw error;
    }
  };

  const handleSaveHorusImage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!horusImageUrl.trim() && !horusImageFile) {
      alert('Please provide an image URL or upload a file');
      return;
    }

    setSavingHorusImage(true);
    try {
      let imageUrl = horusImageUrl.trim();
      
      // If file is provided, upload it first
      if (horusImageFile) {
        imageUrl = await uploadFileToStorage(horusImageFile, 'equipment');
      }

      const horusDocs = await getDocs(collection(db, 'horusImage'));
      
      if (!horusDocs.empty) {
        const docId = horusDocs.docs[0].id;
        await setDoc(doc(db, 'horusImage', docId), {
          url: imageUrl,
          name: horusImageName.trim() || 'Horus Slab Scanner',
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'horusImage'), {
          url: imageUrl,
          name: horusImageName.trim() || 'Horus Slab Scanner',
          updatedAt: serverTimestamp()
        });
      }

      setHorusImage({
        url: imageUrl,
        name: horusImageName.trim() || 'Horus Slab Scanner',
        updatedAt: new Date()
      });
      
      setHorusImageUrl(imageUrl);
      setHorusImageFile(null);
      // Reset file input
      const fileInput = document.getElementById('horus-image-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      alert('Horus image saved successfully!');
    } catch (error) {
      console.error('Error saving Horus image:', error);
      alert('Failed to save Horus image');
    } finally {
      setSavingHorusImage(false);
    }
  };

  const handleClearHorusImage = async () => {
    if (!window.confirm('Are you sure you want to remove the Horus image?')) {
      return;
    }

    try {
      const horusDocs = await getDocs(collection(db, 'horusImage'));
      if (!horusDocs.empty) {
        await deleteDoc(doc(db, 'horusImage', horusDocs.docs[0].id));
      }
      setHorusImage(null);
      setHorusImageUrl('');
      setHorusImageName('');
      alert('Horus image removed successfully!');
    } catch (error) {
      console.error('Error removing Horus image:', error);
      alert('Failed to remove Horus image');
    }
  };

  const handleSaveSassoImage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sassoImageUrl.trim() && !sassoImageFile) {
      alert('Please provide an image URL or upload a file');
      return;
    }

    setSavingSassoImage(true);
    try {
      let imageUrl = sassoImageUrl.trim();
      
      // If file is provided, upload it first
      if (sassoImageFile) {
        imageUrl = await uploadFileToStorage(sassoImageFile, 'equipment');
      }

      const sassoDocs = await getDocs(collection(db, 'sassoImage'));
      
      if (!sassoDocs.empty) {
        const docId = sassoDocs.docs[0].id;
        await setDoc(doc(db, 'sassoImage', docId), {
          url: imageUrl,
          name: sassoImageName.trim() || 'Sasso K-600 Miter Saw',
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'sassoImage'), {
          url: imageUrl,
          name: sassoImageName.trim() || 'Sasso K-600 Miter Saw',
          updatedAt: serverTimestamp()
        });
      }

      setSassoImage({
        url: imageUrl,
        name: sassoImageName.trim() || 'Sasso K-600 Miter Saw',
        updatedAt: new Date()
      });
      
      setSassoImageUrl(imageUrl);
      setSassoImageFile(null);
      // Reset file input
      const fileInput = document.getElementById('sasso-image-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      alert('Sasso image saved successfully!');
    } catch (error) {
      console.error('Error saving Sasso image:', error);
      alert('Failed to save Sasso image');
    } finally {
      setSavingSassoImage(false);
    }
  };

  const handleClearSassoImage = async () => {
    if (!window.confirm('Are you sure you want to remove the Sasso image?')) {
      return;
    }

    try {
      const sassoDocs = await getDocs(collection(db, 'sassoImage'));
      if (!sassoDocs.empty) {
        await deleteDoc(doc(db, 'sassoImage', sassoDocs.docs[0].id));
      }
      setSassoImage(null);
      setSassoImageUrl('');
      setSassoImageName('');
      alert('Sasso image removed successfully!');
    } catch (error) {
      console.error('Error removing Sasso image:', error);
      alert('Failed to remove Sasso image');
    }
  };

  const handleProcessImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newProcessImageName.trim() || !selectedProcessStep) {
      alert('Please provide image name and select a process step');
      return;
    }

    if (!newProcessImageUrl.trim() && !newProcessImageFile) {
      alert('Please provide either an image URL or upload a file');
      return;
    }

    setUploadingProcessImage(true);
    try {
      let imageUrl = newProcessImageUrl.trim();
      
      // If file is provided, upload it first
      if (newProcessImageFile) {
        imageUrl = await uploadFileToStorage(newProcessImageFile, 'process-images');
      }

      const docRef = await addDoc(collection(db, 'processImages'), {
        url: imageUrl,
        name: newProcessImageName.trim(),
        processStep: selectedProcessStep,
        uploadedAt: serverTimestamp(),
        uploadedBy: 'admin'
      });

      setProcessImages([{
        id: docRef.id,
        url: imageUrl,
        name: newProcessImageName.trim(),
        processStep: selectedProcessStep,
        uploadedAt: new Date()
      }, ...processImages]);

      setNewProcessImageUrl('');
      setNewProcessImageName('');
      setNewProcessImageFile(null);
      // Reset file input
      const fileInput = document.getElementById('process-image-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      alert('Process image added successfully!');
    } catch (error) {
      console.error('Error uploading process image:', error);
      alert('Failed to upload process image');
    } finally {
      setUploadingProcessImage(false);
    }
  };

  const handleDeleteProcessImage = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this process image?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'processImages', id));
      setProcessImages(processImages.filter(img => img.id !== id));
      alert('Process image deleted successfully!');
    } catch (error) {
      console.error('Error deleting process image:', error);
      alert('Failed to delete process image');
    }
  };

  const handleSlideUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newSlideUrl.trim() || !newSlideName.trim()) {
      alert('Please provide both slideshow image URL and name');
      return;
    }

    setUploadingSlide(true);
    try {
      const docRef = await addDoc(collection(db, 'slideshowImages'), {
        url: newSlideUrl.trim(),
        name: newSlideName.trim(),
        createdAt: serverTimestamp()
      });

      setSlideshowImages([
        {
          id: docRef.id,
          url: newSlideUrl.trim(),
          name: newSlideName.trim(),
          createdAt: new Date()
        },
        ...slideshowImages
      ]);

      setNewSlideUrl('');
      setNewSlideName('');
      alert('Slideshow image added successfully!');
    } catch (error) {
      console.error('Error uploading slideshow image:', error);
      alert('Failed to upload slideshow image');
    } finally {
      setUploadingSlide(false);
    }
  };

  const handleHomeSlideUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newHomeSlideName.trim()) {
      alert('Please provide a name for the home slideshow image.');
      return;
    }

    if (!newHomeSlideUrl.trim() && !newHomeSlideFile) {
      alert('Please provide either an image URL or upload a file');
      return;
    }

    setUploadingHomeSlide(true);
    try {
      let imageUrl = newHomeSlideUrl.trim();
      
      // If file is provided, upload it first
      if (newHomeSlideFile) {
        imageUrl = await uploadFileToStorage(newHomeSlideFile, 'home-slideshow');
      }

      const docRef = await addDoc(collection(db, 'homeSlideshowImages'), {
        url: imageUrl,
        name: newHomeSlideName.trim(),
        createdAt: serverTimestamp(),
      });

      setHomeSlides([
        {
          id: docRef.id,
          url: imageUrl,
          name: newHomeSlideName.trim(),
          createdAt: new Date(),
        },
        ...homeSlides,
      ]);

      setNewHomeSlideUrl('');
      setNewHomeSlideName('');
      setNewHomeSlideFile(null);
      // Reset file input
      const fileInput = document.getElementById('home-slide-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error uploading home slideshow image:', error);
      alert('Failed to upload home slideshow image');
    } finally {
      setUploadingHomeSlide(false);
    }
  };

  const handleDeleteSlide = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this image from the slideshow?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'slideshowImages', id));
      setSlideshowImages(slideshowImages.filter(img => img.id !== id));
    } catch (error) {
      console.error('Error deleting slideshow image:', error);
      alert('Failed to delete slideshow image');
    }
  };

  const handleDeleteHomeSlide = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this image from the home page slideshow?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'homeSlideshowImages', id));
      setHomeSlides(homeSlides.filter(img => img.id !== id));
    } catch (error) {
      console.error('Error deleting home slideshow image:', error);
      alert('Failed to delete home slideshow image');
    }
  };

  const handleSaveHeadshot = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!headshotUrl.trim()) {
      alert('Please provide a headshot image URL');
      return;
    }

    setSavingHeadshot(true);
    try {
      // For simplicity, always use a single document 'main'
      const headshotDocRef = doc(db, 'headshots', 'main');
      await setDoc(headshotDocRef, {
        url: headshotUrl.trim(),
        name: headshotName.trim() || 'Headshot',
        updatedAt: serverTimestamp()
      });

      setHeadshot({
        url: headshotUrl.trim(),
        name: headshotName.trim() || 'Headshot',
        updatedAt: new Date()
      });

      alert('Headshot updated successfully!');
    } catch (error) {
      console.error('Error saving headshot:', error);
      alert('Failed to save headshot');
    } finally {
      setSavingHeadshot(false);
    }
  };

  const handleSaveInventoryImage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inventoryImageUrl.trim() && !inventoryImageFile) {
      alert('Please provide an image URL or upload a file');
      return;
    }

    setSavingInventoryImage(true);
    try {
      let imageUrl = inventoryImageUrl.trim();
      
      // If file is provided, upload it first
      if (inventoryImageFile) {
        imageUrl = await uploadFileToStorage(inventoryImageFile, 'inventory');
      }

      // Get existing inventory image docs
      const inventoryDocs = await getDocs(collection(db, 'inventoryImage'));
      
      if (!inventoryDocs.empty) {
        // Update existing doc
        const docId = inventoryDocs.docs[0].id;
        await setDoc(doc(db, 'inventoryImage', docId), {
          url: imageUrl,
          name: inventoryImageName.trim() || 'Inventory Image',
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new doc
        await addDoc(collection(db, 'inventoryImage'), {
          url: imageUrl,
          name: inventoryImageName.trim() || 'Inventory Image',
          updatedAt: serverTimestamp()
        });
      }

      setInventoryImage({
        url: imageUrl,
        name: inventoryImageName.trim() || 'Inventory Image',
        updatedAt: new Date()
      });
      
      setInventoryImageUrl(imageUrl);
      setInventoryImageFile(null);
      // Reset file input
      const fileInput = document.getElementById('inventory-image-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      alert('Inventory image saved successfully!');
    } catch (error) {
      console.error('Error saving inventory image:', error);
      alert('Failed to save inventory image');
    } finally {
      setSavingInventoryImage(false);
    }
  };

  const handleSaveHomepageImage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!homepageImageUrl.trim() && !homepageImageFile) {
      alert('Please provide an image URL or upload a file');
      return;
    }

    setSavingHomepageImage(true);
    try {
      let imageUrl = homepageImageUrl.trim();
      
      // If file is provided, upload it first
      if (homepageImageFile) {
        imageUrl = await uploadFileToStorage(homepageImageFile, 'homepage');
      }

      // Get existing homepage image docs
      const homepageDocs = await getDocs(collection(db, 'homepageImage'));
      
      if (!homepageDocs.empty) {
        // Update existing doc
        const docId = homepageDocs.docs[0].id;
        await setDoc(doc(db, 'homepageImage', docId), {
          url: imageUrl,
          name: homepageImageName.trim() || 'Homepage Image',
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new doc
        await addDoc(collection(db, 'homepageImage'), {
          url: imageUrl,
          name: homepageImageName.trim() || 'Homepage Image',
          updatedAt: serverTimestamp()
        });
      }

      setHomepageImage({
        url: imageUrl,
        name: homepageImageName.trim() || 'Homepage Image',
        updatedAt: new Date()
      });
      
      setHomepageImageUrl(imageUrl);
      setHomepageImageFile(null);
      // Reset file input
      const fileInput = document.getElementById('homepage-image-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      alert('Homepage image saved successfully!');
    } catch (error) {
      console.error('Error saving homepage image:', error);
      alert('Failed to save homepage image');
    } finally {
      setSavingHomepageImage(false);
    }
  };

  const handleClearHomepageImage = async () => {
    if (!window.confirm('Are you sure you want to remove the homepage image?')) {
      return;
    }

    try {
      const homepageDocs = await getDocs(collection(db, 'homepageImage'));
      if (!homepageDocs.empty) {
        await deleteDoc(doc(db, 'homepageImage', homepageDocs.docs[0].id));
      }
      setHomepageImage(null);
      setHomepageImageUrl('');
      setHomepageImageName('');
      alert('Homepage image removed successfully!');
    } catch (error) {
      console.error('Error removing homepage image:', error);
      alert('Failed to remove homepage image');
    }
  };

  const handleClearInventoryImage = async () => {
    if (!window.confirm('Are you sure you want to remove the inventory image?')) {
      return;
    }

    try {
      const inventoryDocs = await getDocs(collection(db, 'inventoryImage'));
      if (!inventoryDocs.empty) {
        await deleteDoc(doc(db, 'inventoryImage', inventoryDocs.docs[0].id));
      }
      setInventoryImage(null);
      setInventoryImageUrl('');
      setInventoryImageName('');
      alert('Inventory image removed successfully!');
    } catch (error) {
      console.error('Error removing inventory image:', error);
      alert('Failed to remove inventory image');
    }
  };

  const handleClearHeadshot = async () => {
    if (!window.confirm('Remove the current headshot? This will fall back to the default image.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'headshots', 'main'));
      setHeadshot(null);
      setHeadshotUrl('');
      setHeadshotName('');
    } catch (error) {
      console.error('Error clearing headshot:', error);
      alert('Failed to clear headshot');
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="image-library">
      <div className="section-header">
        <h2>Image Library</h2>
        <p className="section-description">
          Add and manage images for your website. Copy URLs to use in blog posts or page content.
        </p>
      </div>

      <div id="section-homepage-slideshow" className="section-header" style={{ marginTop: '3rem' }}>
        <h2>Home Page Slideshow Images</h2>
        <p className="section-description">
          Manage the images used in the Home page slideshow gallery. These are separate from the Charters gallery.
        </p>
      </div>

      <form onSubmit={handleHomeSlideUpload} className="upload-form">
        <div className="form-group">
          <label htmlFor="homeSlideName">Home Slideshow Image Name</label>
          <input
            type="text"
            id="homeSlideName"
            value={newHomeSlideName}
            onChange={(e) => setNewHomeSlideName(e.target.value)}
            placeholder="e.g., Morning Harbor"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="homeSlideUrl">Home Slideshow Image URL (or upload file below)</label>
          <input
            type="url"
            id="homeSlideUrl"
            value={newHomeSlideUrl}
            onChange={(e) => setNewHomeSlideUrl(e.target.value)}
            placeholder="https://images.unsplash.com/..."
          />
        </div>
        <div className="form-group">
          <label htmlFor="home-slide-file">Or Upload Image File</label>
          <input
            type="file"
            id="home-slide-file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              if (file) {
                handleFileSelect(file, (croppedFile) => {
                  setNewHomeSlideFile(croppedFile);
                  setNewHomeSlideUrl('');
                });
              }
            }}
          />
          {newHomeSlideFile && <p style={{ fontSize: '0.85rem', color: '#EADAB6', marginTop: '0.25rem' }}>Selected: {newHomeSlideFile.name}</p>}
        </div>
        <button type="submit" className="btn-upload" disabled={uploadingHomeSlide}>
          {uploadingHomeSlide ? 'Adding...' : '+ Add Home Slideshow Image'}
        </button>
      </form>

      {loadingHomeSlides ? (
        <div className="loading">Loading home slideshow images...</div>
      ) : homeSlides.length === 0 ? (
        <div className="empty-state">
          <p>No home slideshow images yet. Add your first home slideshow image!</p>
        </div>
      ) : (
        <div className="images-grid">
          {homeSlides.map(image => (
            <div key={image.id} className="image-card">
              <div className="image-preview">
                <img src={image.url} alt={image.name} />
              </div>
              <div className="image-info">
                <h3>{image.name}</h3>
                <div className="image-url">
                  <input 
                    type="text" 
                    value={image.url} 
                    readOnly 
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button 
                    onClick={() => copyToClipboard(image.url, image.id)}
                    className="btn-copy"
                  >
                    {copiedId === image.id ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <button 
                  onClick={() => handleDeleteHomeSlide(image.id)}
                  className="btn-delete-img"
                >
                  Remove from Home Slideshow
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div id="section-homepage-image" className="section-header" style={{ marginTop: '3rem' }}>
        <h2>Homepage Image</h2>
        <p className="section-description">
          Set the main hero image for the homepage. This is a single image displayed prominently on the home page.
        </p>
      </div>

      <form onSubmit={handleSaveHomepageImage} className="upload-form">
        <div className="form-group">
          <label htmlFor="homepageImageName">Image Name</label>
          <input
            type="text"
            id="homepageImageName"
            value={homepageImageName}
            onChange={(e) => setHomepageImageName(e.target.value)}
            placeholder="e.g., Homepage Hero Image"
          />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="homepageImageUrl">Image URL (or upload file below)</label>
          <input
            type="url"
            id="homepageImageUrl"
            value={homepageImageUrl}
            onChange={(e) => setHomepageImageUrl(e.target.value)}
            placeholder="https://example.com/homepage-hero.jpg"
          />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="homepage-image-file">Or Upload Image File</label>
          <input
            type="file"
            id="homepage-image-file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              if (file) {
                handleFileSelect(file, (croppedFile) => {
                  setHomepageImageFile(croppedFile);
                  setHomepageImageUrl('');
                });
              }
            }}
          />
          {homepageImageFile && <p style={{ fontSize: '0.85rem', color: '#EADAB6', marginTop: '0.25rem' }}>Selected: {homepageImageFile.name}</p>}
        </div>
        <button type="submit" className="btn-upload" disabled={savingHomepageImage}>
          {savingHomepageImage ? 'Saving...' : 'Save Homepage Image'}
        </button>
      </form>

      {loadingHomepageImage ? (
        <div className="loading">Loading homepage image...</div>
      ) : !homepageImage || !homepageImage.url ? (
        <div className="empty-state">
          <p>No homepage image set yet. Add a homepage image above.</p>
        </div>
      ) : (
        <div className="images-grid">
          <div className="image-card">
              <div className="image-preview">
              <img src={homepageImage.url} alt={homepageImage.name || 'Homepage Image'} />
              </div>
              <div className="image-info">
              <h3>{homepageImage.name || 'Homepage Image'}</h3>
                <div className="image-url">
                  <input 
                    type="text" 
                  value={homepageImage.url} 
                    readOnly 
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button 
                  onClick={() => copyToClipboard(homepageImage.url, 'homepage')}
                    className="btn-copy"
                  >
                  {copiedId === 'homepage' ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <button 
                onClick={handleClearHomepageImage}
                  className="btn-delete-img"
                >
                Remove Homepage Image
                </button>
              </div>
            </div>
        </div>
      )}

      <div id="section-process-images" className="section-header" style={{ marginTop: '3rem' }}>
        <h2>Our Process Images</h2>
        <p className="section-description">
          Upload and manage images for each step of the Bella Stone process. These images appear on the "Our Process" page when users hover over the timeline items.
        </p>
      </div>

      <form onSubmit={handleProcessImageUpload} className="upload-form">
        <div className="form-group">
          <label htmlFor="processImageName">Image Name</label>
          <input
            type="text"
            id="processImageName"
            value={newProcessImageName}
            onChange={(e) => setNewProcessImageName(e.target.value)}
            placeholder="e.g., Design Consultation Photo"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="processImageUrl">Image URL (or upload file below)</label>
          <input
            type="url"
            id="processImageUrl"
            value={newProcessImageUrl}
            onChange={(e) => setNewProcessImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        <div className="form-group">
          <label htmlFor="process-image-file">Or Upload Image File</label>
          <input
            type="file"
            id="process-image-file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              if (file) {
                handleFileSelect(file, (croppedFile) => {
                  setNewProcessImageFile(croppedFile);
                  setNewProcessImageUrl('');
                });
              }
            }}
          />
          {newProcessImageFile && <p style={{ fontSize: '0.85rem', color: '#EADAB6', marginTop: '0.25rem' }}>Selected: {newProcessImageFile.name}</p>}
        </div>
        <div className="form-group">
          <label htmlFor="processStep">Process Step</label>
          <select
            id="processStep"
            value={selectedProcessStep}
            onChange={(e) => setSelectedProcessStep(e.target.value)}
            required
          >
            {PROCESS_STEPS.map(step => (
              <option key={step.id} value={step.id}>{step.label}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-upload" disabled={uploadingProcessImage}>
          {uploadingProcessImage ? 'Uploading...' : 'Add Process Image'}
        </button>
      </form>

      {loadingProcessImages ? (
        <div className="loading">Loading process images...</div>
      ) : processImages.length === 0 ? (
        <div className="empty-state">
          <p>No process images yet. Upload your first process image above.</p>
        </div>
      ) : (
        <div className="process-images-container">
          {PROCESS_STEPS.map(step => {
            const stepImages = processImages.filter(img => img.processStep === step.id);
            if (stepImages.length === 0) return null;
            
            return (
              <div key={step.id} className="process-step-group" style={{ marginTop: '2rem' }}>
                <h3 className="step-group-title">{step.label}</h3>
        <div className="images-grid">
                  {stepImages.map(image => (
            <div key={image.id} className="image-card">
              <div className="image-preview">
                <img src={image.url} alt={image.name} />
              </div>
              <div className="image-info">
                        <h4>{image.name}</h4>
                <div className="image-url">
                  <input
                    type="text"
                    value={image.url}
                    readOnly
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <button
                    onClick={() => copyToClipboard(image.url, image.id)}
                    className="btn-copy"
                  >
                    {copiedId === image.id ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <button
                          onClick={() => handleDeleteProcessImage(image.id)}
                  className="btn-delete-img"
                >
                          Delete Image
                </button>
              </div>
            </div>
          ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div id="section-horus" className="section-header" style={{ marginTop: '3rem' }}>
        <h2>Horus Slab Scanner Image</h2>
        <p className="section-description">
          Set the image that appears when users hover over the Horus Slab Scanner card on the "Our Process" page.
        </p>
      </div>

      <form onSubmit={handleSaveHorusImage} className="upload-form">
        <div className="form-group">
          <label htmlFor="horusImageName">Image Name</label>
          <input
            type="text"
            id="horusImageName"
            value={horusImageName}
            onChange={(e) => setHorusImageName(e.target.value)}
            placeholder="e.g., Horus Slab Scanner"
          />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="horusImageUrl">Image URL (or upload file below)</label>
          <input
            type="url"
            id="horusImageUrl"
            value={horusImageUrl}
            onChange={(e) => setHorusImageUrl(e.target.value)}
            placeholder="https://example.com/horus-scanner.jpg"
          />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="horus-image-file">Or Upload Image File</label>
          <input
            type="file"
            id="horus-image-file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              if (file) {
                handleFileSelect(file, (croppedFile) => {
                  setHorusImageFile(croppedFile);
                  setHorusImageUrl('');
                });
              }
            }}
          />
          {horusImageFile && <p style={{ fontSize: '0.85rem', color: '#EADAB6', marginTop: '0.25rem' }}>Selected: {horusImageFile.name}</p>}
        </div>
        <button type="submit" className="btn-upload" disabled={savingHorusImage}>
          {savingHorusImage ? 'Saving...' : 'Save Horus Image'}
        </button>
      </form>

      {loadingHorusImage ? (
        <div className="loading">Loading Horus image...</div>
      ) : !horusImage || !horusImage.url ? (
        <div className="empty-state">
          <p>No Horus image set yet. Add a Horus image above.</p>
        </div>
      ) : (
        <div className="images-grid">
          <div className="image-card">
            <div className="image-preview">
              <img src={horusImage.url} alt={horusImage.name || 'Horus Slab Scanner'} />
            </div>
            <div className="image-info">
              <h3>{horusImage.name || 'Horus Slab Scanner'}</h3>
              <div className="image-url">
                <input 
                  type="text" 
                  value={horusImage.url} 
                  readOnly 
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button 
                  onClick={() => copyToClipboard(horusImage.url, 'horus')}
                  className="btn-copy"
                >
                  {copiedId === 'horus' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <button 
                onClick={handleClearHorusImage}
                className="btn-delete-img"
              >
                Remove Horus Image
              </button>
            </div>
          </div>
        </div>
      )}

      <div id="section-sasso" className="section-header" style={{ marginTop: '3rem' }}>
        <h2>Sasso K-600 Miter Saw Image</h2>
        <p className="section-description">
          Set the image that appears when users hover over the Sasso K-600 Miter Saw card on the "Our Process" page.
        </p>
      </div>

      <form onSubmit={handleSaveSassoImage} className="upload-form">
        <div className="form-group">
          <label htmlFor="sassoImageName">Image Name</label>
          <input
            type="text"
            id="sassoImageName"
            value={sassoImageName}
            onChange={(e) => setSassoImageName(e.target.value)}
            placeholder="e.g., Sasso K-600 Miter Saw"
          />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="sassoImageUrl">Image URL (or upload file below)</label>
          <input
            type="url"
            id="sassoImageUrl"
            value={sassoImageUrl}
            onChange={(e) => setSassoImageUrl(e.target.value)}
            placeholder="https://example.com/sasso-saw.jpg"
          />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="sasso-image-file">Or Upload Image File</label>
          <input
            type="file"
            id="sasso-image-file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              if (file) {
                handleFileSelect(file, (croppedFile) => {
                  setSassoImageFile(croppedFile);
                  setSassoImageUrl('');
                });
              }
            }}
          />
          {sassoImageFile && <p style={{ fontSize: '0.85rem', color: '#EADAB6', marginTop: '0.25rem' }}>Selected: {sassoImageFile.name}</p>}
        </div>
        <button type="submit" className="btn-upload" disabled={savingSassoImage}>
          {savingSassoImage ? 'Saving...' : 'Save Sasso Image'}
        </button>
      </form>

      {loadingSassoImage ? (
        <div className="loading">Loading Sasso image...</div>
      ) : !sassoImage || !sassoImage.url ? (
        <div className="empty-state">
          <p>No Sasso image set yet. Add a Sasso image above.</p>
        </div>
      ) : (
        <div className="images-grid">
          <div className="image-card">
            <div className="image-preview">
              <img src={sassoImage.url} alt={sassoImage.name || 'Sasso K-600 Miter Saw'} />
            </div>
            <div className="image-info">
              <h3>{sassoImage.name || 'Sasso K-600 Miter Saw'}</h3>
              <div className="image-url">
                <input 
                  type="text" 
                  value={sassoImage.url} 
                  readOnly 
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button 
                  onClick={() => copyToClipboard(sassoImage.url, 'sasso')}
                  className="btn-copy"
                >
                  {copiedId === 'sasso' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <button 
                onClick={handleClearSassoImage}
                className="btn-delete-img"
              >
                Remove Sasso Image
              </button>
            </div>
          </div>
        </div>
      )}

      <div id="section-inventory" className="section-header" style={{ marginTop: '3rem' }}>
        <h2>Inventory Page Image</h2>
        <p className="section-description">
          Set the image that appears on the Inventory page. This image will be displayed with the "View Full Inventory" button overlay.
        </p>
      </div>

      <form onSubmit={handleSaveInventoryImage} className="upload-form">
        <div className="form-group">
          <label htmlFor="inventoryImageName">Image Name</label>
          <input
            type="text"
            id="inventoryImageName"
            value={inventoryImageName}
            onChange={(e) => setInventoryImageName(e.target.value)}
            placeholder="e.g., Stone Inventory Display"
          />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="inventoryImageUrl">Image URL (or upload file below)</label>
          <input
            type="url"
            id="inventoryImageUrl"
            value={inventoryImageUrl}
            onChange={(e) => setInventoryImageUrl(e.target.value)}
            placeholder="https://example.com/inventory-image.jpg"
          />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label htmlFor="inventory-image-file">Or Upload Image File</label>
          <input
            type="file"
            id="inventory-image-file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              if (file) {
                handleFileSelect(file, (croppedFile) => {
                  setInventoryImageFile(croppedFile);
                  setInventoryImageUrl('');
                });
              }
            }}
          />
          {inventoryImageFile && <p style={{ fontSize: '0.85rem', color: '#EADAB6', marginTop: '0.25rem' }}>Selected: {inventoryImageFile.name}</p>}
        </div>
        <button type="submit" className="btn-upload" disabled={savingInventoryImage}>
          {savingInventoryImage ? 'Saving...' : 'Save Inventory Image'}
        </button>
      </form>

      {loadingInventoryImage ? (
        <div className="loading">Loading inventory image...</div>
      ) : !inventoryImage || !inventoryImage.url ? (
        <div className="empty-state">
          <p>No inventory image set yet. Add an inventory image above.</p>
        </div>
      ) : (
        <div className="images-grid">
          <div className="image-card">
            <div className="image-preview">
              <img src={inventoryImage.url} alt={inventoryImage.name || 'Inventory Image'} />
            </div>
            <div className="image-info">
              <h3>{inventoryImage.name || 'Inventory Image'}</h3>
              <div className="image-url">
                <input 
                  type="text" 
                  value={inventoryImage.url} 
                  readOnly 
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button 
                  onClick={() => copyToClipboard(inventoryImage.url, 'inventory')}
                  className="btn-copy"
                >
                  {copiedId === 'inventory' ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <button 
                onClick={handleClearInventoryImage}
                className="btn-delete-img"
              >
                Remove Inventory Image
              </button>
            </div>
          </div>
        </div>
      )}

      {cropperFile && (
        <ImageCropper
          imageFile={cropperFile}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={cropperAspectRatio}
        />
      )}
    </div>
  );
};

export default ImageLibrary;


