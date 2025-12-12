import { useState } from 'react';
import type { FormEvent } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import './MeasurementPage.css';

interface SinkEntry {
  location: string;
  type: string;
  manufacturerModel: string;
  cutoutTemplateProvided: string;
  physicalSinkOnSite: string;
  revealPreference: string;
  sinkNotes: string;
  sinkFitmentAcknowledgment: boolean;
  templateWithoutSinkAcknowledgment: boolean;
}

interface GrommetEntry {
  label: string;
  sizeInches: string;
  coordinates: string;
  grommetNotes: string;
}

interface FaucetEntry {
  location: string;
  modelNumber: string;
  spacingNotes: string;
  notes: string;
}

interface ApplianceEntry {
  type: string;
  model: string;
  specOption: string;
  specLink: string;
  specDocumentUrl: string;
  notes: string;
}

interface MeasurementFormData {
  // Project Information
  jobName: string;
  customerName: string;
  jobsiteAddress: string;
  contactPhone: string;
  requestedInstallDate: string;
  generalNotes: string;

  // Sinks
  sinks: SinkEntry[];

  // Faucet & Accessories
  faucets: FaucetEntry[];
  mainFaucetCount: number;
  sprayerCount: number;
  soapDispenserCount: number;
  airGapCount: number;
  roFaucetCount: number;
  hotWaterTapCount: number;
  otherDescription: string;
  otherCount: number;
  faucetHoleSpec: string;
  faucetSpacingNotes: string;

  // Grommets
  grommetSubmissionMethod: string;
  grommets: GrommetEntry[];

  // Backsplash
  splashNeeded: string;
  splashHeight: string;
  splashObstructions: string;

  // Appliances
  appliances: ApplianceEntry[];
  applianceClearancesNotes: string;

  // Sink Section Acknowledgment
  sinkTemplateAcknowledgment: boolean;

  // Cabinet Layout
  cabinetsInstalledAndLevel: string;
  fillersAndOverhangsSpec: string;
  fillersAndOverhangsNotes: string;
  islandOverhangReinforcement: string;
  islandOverhangNotes: string;

  // Special Requests
  waterfallEdges: boolean;
  miteredEdges: boolean;
  extendedOverhangs: boolean;
  floatingShelves: boolean;
  embeddedChannelsLightingCharging: boolean;
  expeditedDelivery: boolean;
  thermoforming: boolean;
  customLayoutMeeting: boolean;
  specialRequestsNone: boolean;
  specialRequestsPerDrawingSpec: boolean;
  specialRequestsNotes: string;

  // Acknowledgements
  acknowledgeDisclaimers: boolean;
}

const MeasurementPage = () => {
  const [formData, setFormData] = useState<MeasurementFormData>({
    jobName: '',
    customerName: '',
    jobsiteAddress: '',
    contactPhone: '',
    requestedInstallDate: '',
    generalNotes: '',
    sinks: [],
    faucets: [],
    appliances: [],
    mainFaucetCount: 0,
    sprayerCount: 0,
    soapDispenserCount: 0,
    airGapCount: 0,
    roFaucetCount: 0,
    hotWaterTapCount: 0,
    otherDescription: '',
    otherCount: 0,
    faucetHoleSpec: '',
    faucetSpacingNotes: '',
    grommetSubmissionMethod: '',
    grommets: [],
    splashNeeded: '',
    splashHeight: '',
    splashObstructions: '',
    applianceClearancesNotes: '',
    sinkTemplateAcknowledgment: false,
    cabinetsInstalledAndLevel: '',
    fillersAndOverhangsSpec: '',
    fillersAndOverhangsNotes: '',
    islandOverhangReinforcement: '',
    islandOverhangNotes: '',
    waterfallEdges: false,
    miteredEdges: false,
    extendedOverhangs: false,
    floatingShelves: false,
    embeddedChannelsLightingCharging: false,
    expeditedDelivery: false,
    thermoforming: false,
    customLayoutMeeting: false,
    specialRequestsNone: false,
    specialRequestsPerDrawingSpec: false,
    specialRequestsNotes: '',
    acknowledgeDisclaimers: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [applianceFiles, setApplianceFiles] = useState<Map<number, File>>(new Map());
  const [grommetDrawingFile, setGrommetDrawingFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const addSink = () => {
    setFormData((prev) => ({
      ...prev,
      sinks: [
        ...prev.sinks,
        {
          location: '',
          type: '',
          manufacturerModel: '',
          cutoutTemplateProvided: '',
          physicalSinkOnSite: '',
          revealPreference: '',
          sinkNotes: '',
          sinkFitmentAcknowledgment: false,
          templateWithoutSinkAcknowledgment: false,
        },
      ],
    }));
  };

  const removeSink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sinks: prev.sinks.filter((_, i) => i !== index),
    }));
  };

  const updateSink = (index: number, field: keyof SinkEntry, value: string | boolean) => {
    setFormData((prev) => {
      const newSinks = [...prev.sinks];
      newSinks[index] = { ...newSinks[index], [field]: value };
      return { ...prev, sinks: newSinks };
    });
  };

  const addGrommet = () => {
    setFormData((prev) => ({
      ...prev,
      grommets: [
        ...prev.grommets,
        {
          label: '',
          sizeInches: '',
          coordinates: '',
          grommetNotes: '',
        },
      ],
    }));
  };

  const removeGrommet = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      grommets: prev.grommets.filter((_, i) => i !== index),
    }));
  };

  const updateGrommet = (index: number, field: keyof GrommetEntry, value: string) => {
    setFormData((prev) => {
      const newGrommets = [...prev.grommets];
      newGrommets[index] = { ...newGrommets[index], [field]: value };
      return { ...prev, grommets: newGrommets };
    });
  };

  const addFaucet = () => {
    setFormData((prev) => ({
      ...prev,
      faucets: [
        ...prev.faucets,
        {
          location: '',
          modelNumber: '',
          spacingNotes: '',
          notes: '',
        },
      ],
    }));
  };

  const removeFaucet = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      faucets: prev.faucets.filter((_, i) => i !== index),
    }));
  };

  const updateFaucet = (index: number, field: keyof FaucetEntry, value: string) => {
    setFormData((prev) => {
      const newFaucets = [...prev.faucets];
      newFaucets[index] = { ...newFaucets[index], [field]: value };
      return { ...prev, faucets: newFaucets };
    });
  };

  const addAppliance = () => {
    setFormData((prev) => ({
      ...prev,
      appliances: [
        ...prev.appliances,
        {
          type: '',
          model: '',
          specOption: '',
          specLink: '',
          specDocumentUrl: '',
          notes: '',
        },
      ],
    }));
  };

  const removeAppliance = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      appliances: prev.appliances.filter((_, i) => i !== index),
    }));
  };

  const updateAppliance = (index: number, field: keyof ApplianceEntry, value: string) => {
    setFormData((prev) => {
      const newAppliances = [...prev.appliances];
      newAppliances[index] = { ...newAppliances[index], [field]: value };
      return { ...prev, appliances: newAppliances };
    });
  };

  const handleApplianceFileChange = (index: number, file: File | null) => {
    if (file) {
      setApplianceFiles((prev) => {
        const newMap = new Map(prev);
        newMap.set(index, file);
        return newMap;
      });
    } else {
      setApplianceFiles((prev) => {
        const newMap = new Map(prev);
        newMap.delete(index);
        return newMap;
      });
    }
  };

  const removeApplianceFile = (index: number) => {
    setApplianceFiles((prev) => {
      const newMap = new Map(prev);
      newMap.delete(index);
      return newMap;
    });
    // Reset file input
    const fileInput = document.getElementById(`appliance-spec-doc-${index}`) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Validate sink section acknowledgment
    if (!formData.sinkTemplateAcknowledgment) {
      alert('Please acknowledge the sink template disclaimer in the Sink Information section.');
      setIsSubmitting(false);
      setSubmitStatus('idle');
      return;
    }

    // Validate sink fitment acknowledgments
    const sinksWithoutAcknowledgment = formData.sinks.filter(
      (sink) => sink.physicalSinkOnSite === 'No' && !sink.sinkFitmentAcknowledgment
    );

    if (sinksWithoutAcknowledgment.length > 0) {
      alert('Please acknowledge the sink fitment disclaimer for all sinks where a physical sink is not provided on-site.');
      setIsSubmitting(false);
      setSubmitStatus('idle');
      return;
    }

    // Validate template without sink acknowledgments
    const sinksWithTemplateWithoutAcknowledgment = formData.sinks.filter(
      (sink) => sink.cutoutTemplateProvided === 'Yes (template provided)' && 
                sink.physicalSinkOnSite === 'No' && 
                !sink.templateWithoutSinkAcknowledgment
    );

    if (sinksWithTemplateWithoutAcknowledgment.length > 0) {
      alert('Please acknowledge that if a sink cutout template is provided without the physical sink present, Bella Stone cannot guarantee sink fitment.');
      setIsSubmitting(false);
      setSubmitStatus('idle');
      return;
    }

    try {
      // Upload appliance spec documents
      const appliancesWithDocs = await Promise.all(
        formData.appliances.map(async (appliance, index) => {
          const file = applianceFiles.get(index);
          let specDocumentUrl = appliance.specDocumentUrl;
          
          if (file) {
            try {
              const timestamp = Date.now();
              const fileName = `measurement-appliance-specs/${timestamp}-${index}-${file.name}`;
              const storageRef = ref(storage, fileName);
              await uploadBytes(storageRef, file);
              specDocumentUrl = await getDownloadURL(storageRef);
            } catch (uploadError) {
              console.error(`Error uploading spec document for appliance ${index + 1}:`, uploadError);
              alert(`Error uploading spec document for appliance ${index + 1}. Please try again.`);
              throw uploadError;
            }
          }
          
          return {
            ...appliance,
            specDocumentUrl,
          };
        })
      );

      // Upload grommet drawing file if provided
      let grommetDrawingUrl = '';
      if (grommetDrawingFile && formData.grommetSubmissionMethod === 'Provide marked-up cabinet shop drawings') {
        try {
          const timestamp = Date.now();
          const fileName = `measurement-grommet-drawings/${timestamp}-${grommetDrawingFile.name}`;
          const storageRef = ref(storage, fileName);
          await uploadBytes(storageRef, grommetDrawingFile);
          grommetDrawingUrl = await getDownloadURL(storageRef);
        } catch (uploadError) {
          console.error('Error uploading grommet drawing file:', uploadError);
          alert('Error uploading grommet drawing file. Please try again.');
          setIsSubmitting(false);
          setSubmitStatus('idle');
          return;
        }
      }

      const measurementData = {
        createdAt: serverTimestamp(),
        jobName: formData.jobName.trim(),
        customerName: formData.customerName.trim(),
        jobsiteAddress: formData.jobsiteAddress.trim(),
        contactPhone: formData.contactPhone.trim(),
        requestedInstallDate: formData.requestedInstallDate,
        generalNotes: formData.generalNotes.trim(),
        sinks: formData.sinks,
        faucets: formData.faucets,
        faucetAndAccessories: {
          mainFaucetCount: formData.mainFaucetCount,
          sprayerCount: formData.sprayerCount,
          soapDispenserCount: formData.soapDispenserCount,
          airGapCount: formData.airGapCount,
          roFaucetCount: formData.roFaucetCount,
          hotWaterTapCount: formData.hotWaterTapCount,
          otherDescription: formData.otherDescription.trim(),
          otherCount: formData.otherCount,
          faucetHoleSpec: formData.faucetHoleSpec,
          faucetSpacingNotes: formData.faucetSpacingNotes.trim(),
        },
        grommets: {
          submissionMethod: formData.grommetSubmissionMethod,
          locations: formData.grommets,
          drawingFileUrl: grommetDrawingUrl,
        },
        backsplash: {
          splashNeeded: formData.splashNeeded,
          splashHeight: formData.splashHeight,
          obstructions: formData.splashObstructions.trim(),
        },
        appliances: {
          items: appliancesWithDocs,
          applianceClearancesNotes: formData.applianceClearancesNotes.trim(),
        },
        cabinetLayout: {
          cabinetsInstalledAndLevel: formData.cabinetsInstalledAndLevel,
          fillersAndOverhangsSpec: formData.fillersAndOverhangsSpec,
          fillersAndOverhangsNotes: formData.fillersAndOverhangsNotes.trim(),
          islandOverhangReinforcement: formData.islandOverhangReinforcement,
          islandOverhangNotes: formData.islandOverhangNotes.trim(),
        },
        specialRequests: {
          waterfallEdges: formData.waterfallEdges,
          miteredEdges: formData.miteredEdges,
          extendedOverhangs: formData.extendedOverhangs,
          floatingShelves: formData.floatingShelves,
          embeddedChannelsLightingCharging: formData.embeddedChannelsLightingCharging,
          expeditedDelivery: formData.expeditedDelivery,
          thermoforming: formData.thermoforming,
          customLayoutMeeting: formData.customLayoutMeeting,
          none: formData.specialRequestsNone,
          perDrawingSpec: formData.specialRequestsPerDrawingSpec,
          specialRequestsNotes: formData.specialRequestsNotes.trim(),
        },
        acknowledgements: {
          acknowledgeDisclaimers: formData.acknowledgeDisclaimers,
        },
      };

      await addDoc(collection(db, 'measurementRequests'), measurementData);

      setSubmitStatus('success');
      // Reset form
      setFormData({
        jobName: '',
        customerName: '',
        jobsiteAddress: '',
        contactPhone: '',
        requestedInstallDate: '',
        generalNotes: '',
        sinks: [],
        faucets: [],
        appliances: [],
        mainFaucetCount: 0,
        sprayerCount: 0,
        soapDispenserCount: 0,
        airGapCount: 0,
        roFaucetCount: 0,
        hotWaterTapCount: 0,
        otherDescription: '',
        otherCount: 0,
        faucetHoleSpec: '',
        faucetSpacingNotes: '',
        grommetSubmissionMethod: '',
        grommets: [],
        splashNeeded: '',
        splashHeight: '',
        splashObstructions: '',
        applianceClearancesNotes: '',
        sinkTemplateAcknowledgment: false,
        cabinetsInstalledAndLevel: '',
        fillersAndOverhangsSpec: '',
        fillersAndOverhangsNotes: '',
        islandOverhangReinforcement: '',
        islandOverhangNotes: '',
        waterfallEdges: false,
        miteredEdges: false,
        extendedOverhangs: false,
        floatingShelves: false,
        embeddedChannelsLightingCharging: false,
        expeditedDelivery: false,
        thermoforming: false,
        customLayoutMeeting: false,
        specialRequestsNone: false,
        specialRequestsPerDrawingSpec: false,
        specialRequestsNotes: '',
        acknowledgeDisclaimers: false,
      });
      setApplianceFiles(new Map());
      setGrommetDrawingFile(null);
    } catch (error) {
      console.error('Error submitting measurement checklist:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="measurement-page">
      <div className="measurement-container">
        <h1 className="measurement-title">Bella Stone – Pre Measurement Checklist</h1>
        <p className="measurement-subtitle">
          This form must be submitted to Bella Stone prior to field measure to ensure timely delivery and correct lead-times.
        </p>

        <form onSubmit={handleSubmit} className="measurement-form">
          {/* Project Information */}
          <div className="form-section">
            <h2 className="section-title">Project Information</h2>
            
            <div className="form-group">
              <label htmlFor="jobName">Job Name</label>
              <input
                type="text"
                id="jobName"
                name="jobName"
                value={formData.jobName}
                onChange={handleChange}
                placeholder="Job name or project identifier"
              />
            </div>

            <div className="form-group">
              <label htmlFor="customerName">Customer Name *</label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                placeholder="Customer name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="jobsiteAddress">Jobsite Address *</label>
              <input
                type="text"
                id="jobsiteAddress"
                name="jobsiteAddress"
                value={formData.jobsiteAddress}
                onChange={handleChange}
                required
                placeholder="Full address"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contactPhone">Contact Phone *</label>
              <input
                type="tel"
                id="contactPhone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                required
                placeholder="(414) 555-1234"
              />
            </div>

            <div className="form-group">
              <label htmlFor="requestedInstallDate">Requested Install Date *</label>
              <input
                type="date"
                id="requestedInstallDate"
                name="requestedInstallDate"
                value={formData.requestedInstallDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="generalNotes">General Notes</label>
              <textarea
                id="generalNotes"
                name="generalNotes"
                value={formData.generalNotes}
                onChange={handleChange}
                rows={4}
                placeholder="Any additional project notes..."
              />
            </div>
          </div>

          {/* Sink Information */}
          <div className="form-section">
            <h2 className="section-title">Sink Information</h2>
            <p className="section-helper-text">
              Standard overhangs on undermount sinks is .25-.3"
            </p>

            {formData.sinks.map((sink, index) => (
              <div key={index} className="repeater-item">
                <div className="repeater-item-header">
                  <h3 className="repeater-item-title">Sink {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeSink(index)}
                    className="remove-item-btn"
                  >
                    Remove
                  </button>
                </div>

                <div className="form-group">
                  <label htmlFor={`sink-location-${index}`}>Location *</label>
                  <select
                    id={`sink-location-${index}`}
                    value={sink.location}
                    onChange={(e) => updateSink(index, 'location', e.target.value)}
                    required
                  >
                    <option value="">Select location</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Island">Island</option>
                    <option value="Bar">Bar</option>
                    <option value="Laundry">Laundry</option>
                    <option value="Vanity">Vanity</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor={`sink-type-${index}`}>Type *</label>
                  <select
                    id={`sink-type-${index}`}
                    value={sink.type}
                    onChange={(e) => updateSink(index, 'type', e.target.value)}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="Undermount">Undermount</option>
                    <option value="Farmhouse / Apron Front">Farmhouse / Apron Front</option>
                    <option value="Drop-in">Drop-in</option>
                    <option value="None">None</option>
                    <option value="Per Drawing Spec">Per Drawing Spec</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor={`sink-manufacturer-${index}`}>Manufacturer / Model</label>
                  <input
                    type="text"
                    id={`sink-manufacturer-${index}`}
                    value={sink.manufacturerModel}
                    onChange={(e) => updateSink(index, 'manufacturerModel', e.target.value)}
                    placeholder="e.g., Kohler K-5960"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`sink-template-${index}`}>Cutout Template Provided</label>
                  <select
                    id={`sink-template-${index}`}
                    value={sink.cutoutTemplateProvided}
                    onChange={(e) => {
                      updateSink(index, 'cutoutTemplateProvided', e.target.value);
                      // Reset template acknowledgment if template is not provided or sink is on site
                      if (e.target.value !== 'Yes (template provided)' || sink.physicalSinkOnSite === 'Yes') {
                        updateSink(index, 'templateWithoutSinkAcknowledgment', false);
                      }
                    }}
                  >
                    <option value="">Select option</option>
                    <option value="Yes (template provided)">Yes (template provided)</option>
                    <option value="No (template required)">No (template required)</option>
                    <option value="None">None</option>
                    <option value="Per Drawing Spec">Per Drawing Spec</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor={`sink-physical-${index}`}>Physical Sink On Site</label>
                  <select
                    id={`sink-physical-${index}`}
                    value={sink.physicalSinkOnSite}
                    onChange={(e) => {
                      updateSink(index, 'physicalSinkOnSite', e.target.value);
                      // Reset acknowledgments if sink is provided
                      if (e.target.value === 'Yes') {
                        updateSink(index, 'sinkFitmentAcknowledgment', false);
                        updateSink(index, 'templateWithoutSinkAcknowledgment', false);
                      }
                    }}
                  >
                    <option value="">Select option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {sink.cutoutTemplateProvided === 'Yes (template provided)' && sink.physicalSinkOnSite === 'No' && (
                  <div className="form-group">
                    <div style={{ 
                      padding: '1rem', 
                      backgroundColor: '#1a1a1a', 
                      borderRadius: '6px', 
                      border: '1px solid #333',
                      marginTop: '0.5rem'
                    }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '0.75rem',
                        cursor: 'pointer',
                        color: '#e0e0e0'
                      }}>
                        <input
                          type="checkbox"
                          checked={sink.templateWithoutSinkAcknowledgment}
                          onChange={(e) => updateSink(index, 'templateWithoutSinkAcknowledgment', e.target.checked)}
                          required={sink.cutoutTemplateProvided === 'Yes (template provided)' && sink.physicalSinkOnSite === 'No'}
                          style={{ 
                            marginTop: '0.25rem',
                            cursor: 'pointer',
                            width: '18px',
                            height: '18px',
                            flexShrink: 0
                          }}
                        />
                        <span style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                          I acknowledge that If a sink cutout template is provided without the physical sink present, 
                          Bella Stone cannot guarantee sink fitment. The general contractor assumes all responsibility for fitment.
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {sink.physicalSinkOnSite === 'No' && (
                  <div className="form-group">
                    <div style={{ 
                      padding: '1rem', 
                      backgroundColor: '#1a1a1a', 
                      borderRadius: '6px', 
                      border: '1px solid #333',
                      marginTop: '0.5rem'
                    }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '0.75rem',
                        cursor: 'pointer',
                        color: '#e0e0e0'
                      }}>
                        <input
                          type="checkbox"
                          checked={sink.sinkFitmentAcknowledgment}
                          onChange={(e) => updateSink(index, 'sinkFitmentAcknowledgment', e.target.checked)}
                          required={sink.physicalSinkOnSite === 'No'}
                          style={{ 
                            marginTop: '0.25rem',
                            cursor: 'pointer',
                            width: '18px',
                            height: '18px',
                            flexShrink: 0
                          }}
                        />
                        <span style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                          I acknowledge that by not providing a physical sink on-site for measurement, 
                          Bella Stone will not be held responsible for any issues related to sink fitment 
                          or compatibility. I understand that measurements will be based on provided 
                          specifications and templates, and I accept full responsibility for ensuring 
                          the accuracy of these specifications.
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor={`sink-reveal-${index}`}>Reveal Preference</label>
                  <select
                    id={`sink-reveal-${index}`}
                    value={sink.revealPreference}
                    onChange={(e) => updateSink(index, 'revealPreference', e.target.value)}
                  >
                    <option value="">Select option</option>
                    <option value="Standard (.25–.35&quot; overhang)">Standard (.25–.35" overhang)</option>
                    <option value="Per manufacturer spec">Per manufacturer spec</option>
                    <option value="Per Drawing Spec">Per Drawing Spec</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor={`sink-notes-${index}`}>Sink Notes</label>
                  <textarea
                    id={`sink-notes-${index}`}
                    value={sink.sinkNotes}
                    onChange={(e) => updateSink(index, 'sinkNotes', e.target.value)}
                    rows={3}
                    placeholder="Additional sink notes..."
                  />
                </div>
              </div>
            ))}

            <button type="button" onClick={addSink} className="add-item-btn">
              Add Sink
            </button>

            <div className="form-group" style={{ marginTop: '2rem' }}>
              <div style={{ 
                padding: '1rem', 
                backgroundColor: '#1a1a1a', 
                borderRadius: '6px', 
                border: '1px solid #333'
              }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '0.75rem',
                  cursor: 'pointer',
                  color: '#e0e0e0'
                }}>
                  <input
                    type="checkbox"
                    name="sinkTemplateAcknowledgment"
                    checked={formData.sinkTemplateAcknowledgment}
                    onChange={handleChange}
                    required
                    style={{ 
                      marginTop: '0.25rem',
                      cursor: 'pointer',
                      width: '18px',
                      height: '18px',
                      flexShrink: 0
                    }}
                  />
                  <span style={{ fontSize: '0.95rem', lineHeight: '1.5' }}>
                    I acknowledge that If a sink cutout template is provided without the physical sink present, 
                    Bella Stone cannot guarantee sink fitment. The general contractor assumes all responsibility for fitment.
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Faucet & Accessory Holes */}
          <div className="form-section">
            <h2 className="section-title">Faucet & Accessory Holes</h2>

            {formData.faucets.map((faucet, index) => (
              <div key={index} className="repeater-item">
                <div className="repeater-item-header">
                  <h3 className="repeater-item-title">Faucet {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeFaucet(index)}
                    className="remove-item-btn"
                  >
                    Remove
                  </button>
                </div>

                <div className="form-group">
                  <label htmlFor={`faucet-location-${index}`}>Location *</label>
                  <input
                    type="text"
                    id={`faucet-location-${index}`}
                    value={faucet.location}
                    onChange={(e) => updateFaucet(index, 'location', e.target.value)}
                    required
                    placeholder="e.g., Kitchen, Island, Bar"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`faucet-model-${index}`}>Model Number</label>
                  <input
                    type="text"
                    id={`faucet-model-${index}`}
                    value={faucet.modelNumber}
                    onChange={(e) => updateFaucet(index, 'modelNumber', e.target.value)}
                    placeholder="Faucet model number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`faucet-spacing-${index}`}>Spacing Notes</label>
                  <textarea
                    id={`faucet-spacing-${index}`}
                    value={faucet.spacingNotes}
                    onChange={(e) => updateFaucet(index, 'spacingNotes', e.target.value)}
                    rows={3}
                    placeholder="Faucet spacing specifications..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`faucet-notes-${index}`}>Notes</label>
                  <textarea
                    id={`faucet-notes-${index}`}
                    value={faucet.notes}
                    onChange={(e) => updateFaucet(index, 'notes', e.target.value)}
                    rows={3}
                    placeholder="Additional faucet notes..."
                  />
                </div>
              </div>
            ))}

            <button type="button" onClick={addFaucet} className="add-item-btn">
              Add Faucet
            </button>
          </div>

          {/* Grommet Hole Locations */}
          <div className="form-section">
            <h2 className="section-title">Grommet Hole Locations</h2>
            <p className="section-helper-text">
              Grommet locations may be provided by markup on cabinet shop drawings or requested as a submittal from Bella Stone after measurement.
              <br />
              If a submittal is requested, no installs will be scheduled until the submitted drawing is returned and approved.
              <br />
              Grommet holes drilled on site will require a change order and may not be completed promptly based on available schedule.
            </p>

            <div className="form-group">
              <label htmlFor="grommetSubmissionMethod">Grommet Submission Method *</label>
              <select
                id="grommetSubmissionMethod"
                name="grommetSubmissionMethod"
                value={formData.grommetSubmissionMethod}
                onChange={handleChange}
                required
              >
                <option value="" disabled>Select method</option>
                <option value="Directly in this form">Directly in this form</option>
                <option value="Provide marked-up cabinet shop drawings">Provide marked-up cabinet shop drawings</option>
                <option value="Request Bella Stone submittal post-measure">Request Bella Stone submittal post-measure</option>
                <option value="None">None</option>
                <option value="Per Drawing Spec">Per Drawing Spec</option>
              </select>
            </div>

            {formData.grommetSubmissionMethod === 'Provide marked-up cabinet shop drawings' && (
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label htmlFor="grommetDrawingFile">Upload Marked-Up Cabinet Shop Drawings</label>
                <input
                  type="file"
                  id="grommetDrawingFile"
                  accept=".pdf,.jpg,.jpeg,.png,.dwg,.dxf"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setGrommetDrawingFile(file);
                  }}
                />
                {grommetDrawingFile && (
                  <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#0a0a0a', borderRadius: '4px', border: '1px solid #333' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#ccc', fontSize: '0.9rem' }}>{grommetDrawingFile.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setGrommetDrawingFile(null);
                          const fileInput = document.getElementById('grommetDrawingFile') as HTMLInputElement;
                          if (fileInput) fileInput.value = '';
                        }}
                        className="remove-item-btn"
                        style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
                <p style={{ 
                  marginTop: '0.75rem', 
                  padding: '0.75rem', 
                  backgroundColor: '#1a1a1a', 
                  borderRadius: '4px', 
                  border: '1px solid #333',
                  color: '#e0e0e0',
                  fontSize: '0.9rem',
                  lineHeight: '1.5'
                }}>
                  <strong>Note:</strong> No install date will be provided until hole locations are submitted.
                </p>
              </div>
            )}

            {formData.grommetSubmissionMethod === 'Directly in this form' && (
              <>
                {formData.grommets.map((grommet, index) => (
                  <div key={index} className="repeater-item">
                    <div className="repeater-item-header">
                      <h3 className="repeater-item-title">Grommet {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removeGrommet(index)}
                        className="remove-item-btn"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="form-group">
                      <label htmlFor={`grommet-label-${index}`}>Label</label>
                      <input
                        type="text"
                        id={`grommet-label-${index}`}
                        value={grommet.label}
                        onChange={(e) => updateGrommet(index, 'label', e.target.value)}
                        placeholder="e.g., Grommet 1"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`grommet-size-${index}`}>Size (inches)</label>
                      <input
                        type="text"
                        id={`grommet-size-${index}`}
                        value={grommet.sizeInches}
                        onChange={(e) => updateGrommet(index, 'sizeInches', e.target.value)}
                        placeholder="e.g., 2.0"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`grommet-coordinates-${index}`}>Coordinates</label>
                      <input
                        type="text"
                        id={`grommet-coordinates-${index}`}
                        value={grommet.coordinates}
                        onChange={(e) => updateGrommet(index, 'coordinates', e.target.value)}
                        placeholder="Provide coordinates relative to front-left cabinet corner, unless noted otherwise."
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`grommet-notes-${index}`}>Grommet Notes</label>
                      <textarea
                        id={`grommet-notes-${index}`}
                        value={grommet.grommetNotes}
                        onChange={(e) => updateGrommet(index, 'grommetNotes', e.target.value)}
                        rows={2}
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>
                ))}

                <button type="button" onClick={addGrommet} className="add-item-btn">
                  Add Grommet
                </button>
              </>
            )}
          </div>

          {/* Backsplash Requirements */}
          <div className="form-section">
            <h2 className="section-title">Backsplash Requirements</h2>

            <div className="form-group">
              <label htmlFor="splashNeeded">Splash Needed</label>
              <select
                id="splashNeeded"
                name="splashNeeded"
                value={formData.splashNeeded}
                onChange={handleChange}
              >
                <option value="">Select option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Per Drawing Spec">Per Drawing Spec</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="splashHeight">Splash Height</label>
              <select
                id="splashHeight"
                name="splashHeight"
                value={formData.splashHeight}
                onChange={handleChange}
              >
                <option value="">Select option</option>
                <option value="4&quot;">4"</option>
                <option value="Full Height">Full Height</option>
                <option value="Custom">Custom</option>
                <option value="None">None</option>
                <option value="Per Drawing Spec">Per Drawing Spec</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="splashObstructions">Splash Obstructions</label>
              <textarea
                id="splashObstructions"
                name="splashObstructions"
                value={formData.splashObstructions}
                onChange={handleChange}
                rows={4}
                placeholder="List outlets, switches, windows, or other obstacles."
              />
            </div>
          </div>

          {/* Appliance Specs & Cutouts */}
          <div className="form-section">
            <h2 className="section-title">Appliance Specs & Cutouts</h2>

            {formData.appliances.map((appliance, index) => (
              <div key={index} className="repeater-item">
                <div className="repeater-item-header">
                  <h3 className="repeater-item-title">Appliance {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => removeAppliance(index)}
                    className="remove-item-btn"
                  >
                    Remove
                  </button>
                </div>

                <div className="form-group">
                  <label htmlFor={`appliance-type-${index}`}>Appliance Type *</label>
                  <select
                    id={`appliance-type-${index}`}
                    value={appliance.type}
                    onChange={(e) => updateAppliance(index, 'type', e.target.value)}
                    required
                  >
                    <option value="">Select appliance type</option>
                    <option value="Slide-in Range">Slide-in Range</option>
                    <option value="Cooktop">Cooktop</option>
                    <option value="Wall Oven">Wall Oven</option>
                    <option value="Downdraft">Downdraft</option>
                    <option value="Hood">Hood</option>
                    <option value="Refrigerator">Refrigerator</option>
                    <option value="Microwave Drawer">Microwave Drawer</option>
                    <option value="Beverage Center / Ice Maker">Beverage Center / Ice Maker</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor={`appliance-model-${index}`}>Model</label>
                  <input
                    type="text"
                    id={`appliance-model-${index}`}
                    value={appliance.model}
                    onChange={(e) => updateAppliance(index, 'model', e.target.value)}
                    placeholder="Model number"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`appliance-spec-${index}`}>Spec Option</label>
                  <select
                    id={`appliance-spec-${index}`}
                    value={appliance.specOption}
                    onChange={(e) => updateAppliance(index, 'specOption', e.target.value)}
                  >
                    <option value="">Select option</option>
                    <option value="None">None</option>
                    <option value="Per Drawing Spec">Per Drawing Spec</option>
                    <option value="Model Specified">Model Specified</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor={`appliance-spec-link-${index}`}>Manufacturer Specs Link</label>
                  <input
                    type="url"
                    id={`appliance-spec-link-${index}`}
                    value={appliance.specLink}
                    onChange={(e) => updateAppliance(index, 'specLink', e.target.value)}
                    placeholder="https://manufacturer.com/specs/..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`appliance-spec-doc-${index}`}>Upload Spec Document</label>
                  <input
                    type="file"
                    id={`appliance-spec-doc-${index}`}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleApplianceFileChange(index, file);
                    }}
                  />
                  {applianceFiles.has(index) && (
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', backgroundColor: '#0a0a0a', borderRadius: '4px', border: '1px solid #333' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#ccc', fontSize: '0.9rem' }}>{applianceFiles.get(index)?.name}</span>
                        <button
                          type="button"
                          onClick={() => removeApplianceFile(index)}
                          className="remove-item-btn"
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor={`appliance-notes-${index}`}>Notes</label>
                  <textarea
                    id={`appliance-notes-${index}`}
                    value={appliance.notes}
                    onChange={(e) => updateAppliance(index, 'notes', e.target.value)}
                    rows={3}
                    placeholder="Additional appliance notes..."
                  />
                </div>
              </div>
            ))}

            <button type="button" onClick={addAppliance} className="add-item-btn">
              Add Appliance
            </button>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label htmlFor="applianceClearancesNotes">Appliance Clearances Notes</label>
              <textarea
                id="applianceClearancesNotes"
                name="applianceClearancesNotes"
                value={formData.applianceClearancesNotes}
                onChange={handleChange}
                rows={4}
                placeholder="Specify any required clearances, centerlines, or special cutout requirements."
              />
            </div>
          </div>

          {/* Cabinet Layout Notes */}
          <div className="form-section">
            <h2 className="section-title">Cabinet Layout Notes</h2>

            <div className="form-group">
              <label htmlFor="cabinetsInstalledAndLevel">Cabinets Installed and Level</label>
              <select
                id="cabinetsInstalledAndLevel"
                name="cabinetsInstalledAndLevel"
                value={formData.cabinetsInstalledAndLevel}
                onChange={handleChange}
              >
                <option value="">Select option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fillersAndOverhangsSpec">Overhang Spec</label>
              <select
                id="fillersAndOverhangsSpec"
                name="fillersAndOverhangsSpec"
                value={formData.fillersAndOverhangsSpec}
                onChange={handleChange}
              >
                <option value="" disabled>Select option</option>
                <option value="None">None</option>
                <option value="Per Drawing Spec">Per Drawing Spec</option>
                <option value="Custom">Custom</option>
              </select>
              <p className="section-helper-text" style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                Unsupported overhang: 8" for 3cm natural stone or 14" for 3cm quartz
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="fillersAndOverhangsNotes">Overhang Notes</label>
              <textarea
                id="fillersAndOverhangsNotes"
                name="fillersAndOverhangsNotes"
                value={formData.fillersAndOverhangsNotes}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="islandOverhangReinforcement">Island Overhang Reinforcement</label>
              <select
                id="islandOverhangReinforcement"
                name="islandOverhangReinforcement"
                value={formData.islandOverhangReinforcement}
                onChange={handleChange}
              >
                <option value="" disabled>Select option</option>
                <option value="Not required (overhang ≤ 10–12&quot;)">Not required (overhang ≤ 10–12")</option>
                <option value="Required (corbels, steel bars, brackets)">Required (corbels, steel bars, brackets)</option>
                <option value="Request for Bella Stone to provide">Request for Bella Stone to provide</option>
                <option value="None">None</option>
                <option value="Per Drawing Spec">Per Drawing Spec</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="islandOverhangNotes">Island Overhang Notes</label>
              <textarea
                id="islandOverhangNotes"
                name="islandOverhangNotes"
                value={formData.islandOverhangNotes}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>

          {/* Unique / Special Requests */}
          <div className="form-section">
            <h2 className="section-title">Unique / Special Requests</h2>

            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="waterfallEdges"
                  checked={formData.waterfallEdges}
                  onChange={handleChange}
                />
                <span>Waterfall edges</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="miteredEdges"
                  checked={formData.miteredEdges}
                  onChange={handleChange}
                />
                <span>Mitered edges</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="extendedOverhangs"
                  checked={formData.extendedOverhangs}
                  onChange={handleChange}
                />
                <span>Extended overhangs</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="floatingShelves"
                  checked={formData.floatingShelves}
                  onChange={handleChange}
                />
                <span>Floating shelves / hidden brackets</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="embeddedChannelsLightingCharging"
                  checked={formData.embeddedChannelsLightingCharging}
                  onChange={handleChange}
                />
                <span>Embedded channels / lighting / charging stations</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="expeditedDelivery"
                  checked={formData.expeditedDelivery}
                  onChange={handleChange}
                />
                <span>Expedited delivery</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="thermoforming"
                  checked={formData.thermoforming}
                  onChange={handleChange}
                />
                <span>Thermoforming</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="customLayoutMeeting"
                  checked={formData.customLayoutMeeting}
                  onChange={handleChange}
                />
                <span>Custom layout meeting ($300)</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="specialRequestsNone"
                  checked={formData.specialRequestsNone}
                  onChange={handleChange}
                />
                <span>None</span>
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="specialRequestsPerDrawingSpec"
                  checked={formData.specialRequestsPerDrawingSpec}
                  onChange={handleChange}
                />
                <span>Per Drawing Spec</span>
              </label>
            </div>

            <div className="form-group">
              <label htmlFor="specialRequestsNotes">Special Requests Notes</label>
              <textarea
                id="specialRequestsNotes"
                name="specialRequestsNotes"
                value={formData.specialRequestsNotes}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </div>

          {/* Required Disclaimers */}
          <div className="form-section disclaimers-section">
            <h2 className="section-title">Required Disclaimers</h2>
            
            <div className="disclaimers-text">
              <p>
                This checklist must be submitted to Bella Stone prior to field measure to ensure product can be delivered in a timely fashion and all lead-times can be met. Any missing or incomplete information may delay production.
              </p>
              <p>
                If a sink cutout template is provided without the physical sink present, Bella Stone cannot guarantee sink fitment. The general contractor assumes all responsibility for fitment.
              </p>
              <p>
                All layouts are done digitally to the best of the technicians ability within the availabe material quoted for the job. If a custom layout meeting is requested, there may be changes to the quote if more material is necessarry.
              </p>
              <p>
                Grommet holes drilled on site will require a change order and may not be able to be completed promptly based on available schedule.
              </p>
              <p>
                If a submittal is requested for grommet locations, no installs will be scheduled until the submitted drawing is returned and approved.
              </p>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="acknowledgeDisclaimers"
                  checked={formData.acknowledgeDisclaimers}
                  onChange={handleChange}
                  required
                />
                <span>I have read and acknowledge the above disclaimers. *</span>
              </label>
            </div>
          </div>

          {submitStatus === 'success' && (
            <div className="form-message success">
              Measurement checklist submitted to Bella Stone.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="form-message error">
              There was an error submitting your checklist. Please try again or contact the office.
            </div>
          )}

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Checklist'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MeasurementPage;

