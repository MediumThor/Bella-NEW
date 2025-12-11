import { useState } from 'react';
import type { FormEvent } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import './MeasurementPage.css';

interface SinkEntry {
  location: string;
  type: string;
  manufacturerModel: string;
  cutoutTemplateProvided: string;
  physicalSinkOnSite: string;
  revealPreference: string;
  sinkNotes: string;
}

interface GrommetEntry {
  label: string;
  sizeInches: string;
  coordinates: string;
  grommetNotes: string;
}

interface MeasurementFormData {
  // Project Information
  customerName: string;
  jobsiteAddress: string;
  contactPhone: string;
  requestedInstallDate: string;
  generalNotes: string;

  // Sinks
  sinks: SinkEntry[];

  // Faucet & Accessories
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
  slideInRangeModel: string;
  slideInRangeSpecOption: string;
  slideInRangeNotes: string;
  cooktopModel: string;
  cooktopSpecOption: string;
  cooktopNotes: string;
  wallOvenModel: string;
  wallOvenSpecOption: string;
  wallOvenNotes: string;
  downdraftModel: string;
  downdraftSpecOption: string;
  downdraftNotes: string;
  hoodModel: string;
  hoodSpecOption: string;
  hoodNotes: string;
  refrigeratorModel: string;
  refrigeratorSpecOption: string;
  refrigeratorNotes: string;
  microwaveDrawerModel: string;
  microwaveDrawerSpecOption: string;
  microwaveDrawerNotes: string;
  beverageCenterModel: string;
  beverageCenterSpecOption: string;
  beverageCenterNotes: string;
  otherApplianceDescription: string;
  otherApplianceModel: string;
  otherApplianceSpecOption: string;
  otherApplianceNotes: string;
  applianceClearancesNotes: string;

  // Cabinet Layout
  cabinetsInstalledAndLevel: string;
  fillersAndOverhangsSpec: string;
  fillersAndOverhangsNotes: string;
  outOfSquareOrScribing: string;
  outOfSquareNotes: string;
  islandOverhangReinforcement: string;
  islandOverhangNotes: string;

  // Special Requests
  radiusCorners: boolean;
  waterfallEdges: boolean;
  miteredEdges: boolean;
  seamPreferences: boolean;
  extendedOverhangs: boolean;
  floatingShelves: boolean;
  embeddedChannelsLightingCharging: boolean;
  specialRequestsNone: boolean;
  specialRequestsPerDrawingSpec: boolean;
  specialRequestsNotes: string;

  // Acknowledgements
  acknowledgeDisclaimers: boolean;
}

const MeasurementPage = () => {
  const [formData, setFormData] = useState<MeasurementFormData>({
    customerName: '',
    jobsiteAddress: '',
    contactPhone: '',
    requestedInstallDate: '',
    generalNotes: '',
    sinks: [],
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
    slideInRangeModel: '',
    slideInRangeSpecOption: '',
    slideInRangeNotes: '',
    cooktopModel: '',
    cooktopSpecOption: '',
    cooktopNotes: '',
    wallOvenModel: '',
    wallOvenSpecOption: '',
    wallOvenNotes: '',
    downdraftModel: '',
    downdraftSpecOption: '',
    downdraftNotes: '',
    hoodModel: '',
    hoodSpecOption: '',
    hoodNotes: '',
    refrigeratorModel: '',
    refrigeratorSpecOption: '',
    refrigeratorNotes: '',
    microwaveDrawerModel: '',
    microwaveDrawerSpecOption: '',
    microwaveDrawerNotes: '',
    beverageCenterModel: '',
    beverageCenterSpecOption: '',
    beverageCenterNotes: '',
    otherApplianceDescription: '',
    otherApplianceModel: '',
    otherApplianceSpecOption: '',
    otherApplianceNotes: '',
    applianceClearancesNotes: '',
    cabinetsInstalledAndLevel: '',
    fillersAndOverhangsSpec: '',
    fillersAndOverhangsNotes: '',
    outOfSquareOrScribing: '',
    outOfSquareNotes: '',
    islandOverhangReinforcement: '',
    islandOverhangNotes: '',
    radiusCorners: false,
    waterfallEdges: false,
    miteredEdges: false,
    seamPreferences: false,
    extendedOverhangs: false,
    floatingShelves: false,
    embeddedChannelsLightingCharging: false,
    specialRequestsNone: false,
    specialRequestsPerDrawingSpec: false,
    specialRequestsNotes: '',
    acknowledgeDisclaimers: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

  const updateSink = (index: number, field: keyof SinkEntry, value: string) => {
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const measurementData = {
        createdAt: serverTimestamp(),
        customerName: formData.customerName.trim(),
        jobsiteAddress: formData.jobsiteAddress.trim(),
        contactPhone: formData.contactPhone.trim(),
        requestedInstallDate: formData.requestedInstallDate,
        generalNotes: formData.generalNotes.trim(),
        sinks: formData.sinks,
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
        },
        backsplash: {
          splashNeeded: formData.splashNeeded,
          splashHeight: formData.splashHeight,
          obstructions: formData.splashObstructions.trim(),
        },
        appliances: {
          slideInRange: {
            model: formData.slideInRangeModel.trim(),
            specOption: formData.slideInRangeSpecOption,
            notes: formData.slideInRangeNotes.trim(),
          },
          cooktop: {
            model: formData.cooktopModel.trim(),
            specOption: formData.cooktopSpecOption,
            notes: formData.cooktopNotes.trim(),
          },
          wallOven: {
            model: formData.wallOvenModel.trim(),
            specOption: formData.wallOvenSpecOption,
            notes: formData.wallOvenNotes.trim(),
          },
          downdraft: {
            model: formData.downdraftModel.trim(),
            specOption: formData.downdraftSpecOption,
            notes: formData.downdraftNotes.trim(),
          },
          hood: {
            model: formData.hoodModel.trim(),
            specOption: formData.hoodSpecOption,
            notes: formData.hoodNotes.trim(),
          },
          refrigerator: {
            model: formData.refrigeratorModel.trim(),
            specOption: formData.refrigeratorSpecOption,
            notes: formData.refrigeratorNotes.trim(),
          },
          microwaveDrawer: {
            model: formData.microwaveDrawerModel.trim(),
            specOption: formData.microwaveDrawerSpecOption,
            notes: formData.microwaveDrawerNotes.trim(),
          },
          beverageCenter: {
            model: formData.beverageCenterModel.trim(),
            specOption: formData.beverageCenterSpecOption,
            notes: formData.beverageCenterNotes.trim(),
          },
          other: {
            description: formData.otherApplianceDescription.trim(),
            model: formData.otherApplianceModel.trim(),
            specOption: formData.otherApplianceSpecOption,
            notes: formData.otherApplianceNotes.trim(),
          },
          applianceClearancesNotes: formData.applianceClearancesNotes.trim(),
        },
        cabinetLayout: {
          cabinetsInstalledAndLevel: formData.cabinetsInstalledAndLevel,
          fillersAndOverhangsSpec: formData.fillersAndOverhangsSpec,
          fillersAndOverhangsNotes: formData.fillersAndOverhangsNotes.trim(),
          outOfSquareOrScribing: formData.outOfSquareOrScribing,
          outOfSquareNotes: formData.outOfSquareNotes.trim(),
          islandOverhangReinforcement: formData.islandOverhangReinforcement,
          islandOverhangNotes: formData.islandOverhangNotes.trim(),
        },
        specialRequests: {
          radiusCorners: formData.radiusCorners,
          waterfallEdges: formData.waterfallEdges,
          miteredEdges: formData.miteredEdges,
          seamPreferences: formData.seamPreferences,
          extendedOverhangs: formData.extendedOverhangs,
          floatingShelves: formData.floatingShelves,
          embeddedChannelsLightingCharging: formData.embeddedChannelsLightingCharging,
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
        customerName: '',
        jobsiteAddress: '',
        contactPhone: '',
        requestedInstallDate: '',
        generalNotes: '',
        sinks: [],
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
        slideInRangeModel: '',
        slideInRangeSpecOption: '',
        slideInRangeNotes: '',
        cooktopModel: '',
        cooktopSpecOption: '',
        cooktopNotes: '',
        wallOvenModel: '',
        wallOvenSpecOption: '',
        wallOvenNotes: '',
        downdraftModel: '',
        downdraftSpecOption: '',
        downdraftNotes: '',
        hoodModel: '',
        hoodSpecOption: '',
        hoodNotes: '',
        refrigeratorModel: '',
        refrigeratorSpecOption: '',
        refrigeratorNotes: '',
        microwaveDrawerModel: '',
        microwaveDrawerSpecOption: '',
        microwaveDrawerNotes: '',
        beverageCenterModel: '',
        beverageCenterSpecOption: '',
        beverageCenterNotes: '',
        otherApplianceDescription: '',
        otherApplianceModel: '',
        otherApplianceSpecOption: '',
        otherApplianceNotes: '',
        applianceClearancesNotes: '',
        cabinetsInstalledAndLevel: '',
        fillersAndOverhangsSpec: '',
        fillersAndOverhangsNotes: '',
        outOfSquareOrScribing: '',
        outOfSquareNotes: '',
        islandOverhangReinforcement: '',
        islandOverhangNotes: '',
        radiusCorners: false,
        waterfallEdges: false,
        miteredEdges: false,
        seamPreferences: false,
        extendedOverhangs: false,
        floatingShelves: false,
        embeddedChannelsLightingCharging: false,
        specialRequestsNone: false,
        specialRequestsPerDrawingSpec: false,
        specialRequestsNotes: '',
        acknowledgeDisclaimers: false,
      });
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
        <h1 className="measurement-title">Bella Stone – Cabinet Maker Measurement Checklist</h1>
        <p className="measurement-subtitle">
          This form must be submitted to Bella Stone prior to field measure to ensure timely delivery and correct lead-times.
        </p>

        <form onSubmit={handleSubmit} className="measurement-form">
          {/* Project Information */}
          <div className="form-section">
            <h2 className="section-title">Project Information</h2>
            
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
              If a sink cutout template is provided without the physical sink present, Bella Stone cannot guarantee sink fitment. The general contractor assumes all responsibility for fitment.
              <br />
              Standard reveal is .25–.35" overhang on undermount sinks.
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
                    onChange={(e) => updateSink(index, 'cutoutTemplateProvided', e.target.value)}
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
                    onChange={(e) => updateSink(index, 'physicalSinkOnSite', e.target.value)}
                  >
                    <option value="">Select option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor={`sink-reveal-${index}`}>Reveal Preference</label>
                  <select
                    id={`sink-reveal-${index}`}
                    value={sink.revealPreference}
                    onChange={(e) => updateSink(index, 'revealPreference', e.target.value)}
                  >
                    <option value="">Select option</option>
                    <option value="Positive">Positive</option>
                    <option value="Zero">Zero</option>
                    <option value="Negative">Negative</option>
                    <option value="Standard (.25–.35&quot; overhang)">Standard (.25–.35" overhang)</option>
                    <option value="None">None</option>
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
          </div>

          {/* Faucet & Accessory Holes */}
          <div className="form-section">
            <h2 className="section-title">Faucet & Accessory Holes</h2>

            <div className="form-group">
              <label htmlFor="faucetHoleSpec">Faucet Hole Specification</label>
              <select
                id="faucetHoleSpec"
                name="faucetHoleSpec"
                value={formData.faucetHoleSpec}
                onChange={handleChange}
              >
                <option value="">Select option</option>
                <option value="None">None</option>
                <option value="Per Drawing Spec">Per Drawing Spec</option>
                <option value="Custom (use counts below)">Custom (use counts below)</option>
              </select>
            </div>

            {formData.faucetHoleSpec === 'Custom (use counts below)' && (
              <>
                <div className="form-group">
                  <label htmlFor="mainFaucetCount">Main Faucet Count</label>
                  <input
                    type="number"
                    id="mainFaucetCount"
                    name="mainFaucetCount"
                    value={formData.mainFaucetCount}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sprayerCount">Sprayer Count</label>
                  <input
                    type="number"
                    id="sprayerCount"
                    name="sprayerCount"
                    value={formData.sprayerCount}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="soapDispenserCount">Soap Dispenser Count</label>
                  <input
                    type="number"
                    id="soapDispenserCount"
                    name="soapDispenserCount"
                    value={formData.soapDispenserCount}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="airGapCount">Air Gap Count</label>
                  <input
                    type="number"
                    id="airGapCount"
                    name="airGapCount"
                    value={formData.airGapCount}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="roFaucetCount">RO Faucet Count</label>
                  <input
                    type="number"
                    id="roFaucetCount"
                    name="roFaucetCount"
                    value={formData.roFaucetCount}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="hotWaterTapCount">Hot Water Tap Count</label>
                  <input
                    type="number"
                    id="hotWaterTapCount"
                    name="hotWaterTapCount"
                    value={formData.hotWaterTapCount}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="otherDescription">Other Description</label>
                  <input
                    type="text"
                    id="otherDescription"
                    name="otherDescription"
                    value={formData.otherDescription}
                    onChange={handleChange}
                    placeholder="Describe other accessory"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="otherCount">Other Count</label>
                  <input
                    type="number"
                    id="otherCount"
                    name="otherCount"
                    value={formData.otherCount}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="faucetSpacingNotes">Faucet Spacing Notes</label>
              <textarea
                id="faucetSpacingNotes"
                name="faucetSpacingNotes"
                value={formData.faucetSpacingNotes}
                onChange={handleChange}
                rows={3}
                placeholder="Specify spacing or indicate 'Per Drawing Spec'."
              />
            </div>
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
                <option value="">Select method</option>
                <option value="Directly in this form">Directly in this form</option>
                <option value="Provide marked-up cabinet shop drawings">Provide marked-up cabinet shop drawings</option>
                <option value="Request Bella Stone submittal post-measure">Request Bella Stone submittal post-measure</option>
                <option value="None">None</option>
                <option value="Per Drawing Spec">Per Drawing Spec</option>
              </select>
            </div>

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

            {/* Slide-in Range */}
            <div className="appliance-group">
              <h3 className="appliance-group-title">Slide-in Range</h3>
              <div className="form-group">
                <label htmlFor="slideInRangeModel">Model</label>
                <input
                  type="text"
                  id="slideInRangeModel"
                  name="slideInRangeModel"
                  value={formData.slideInRangeModel}
                  onChange={handleChange}
                  placeholder="Model number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="slideInRangeSpecOption">Spec Option</label>
                <select
                  id="slideInRangeSpecOption"
                  name="slideInRangeSpecOption"
                  value={formData.slideInRangeSpecOption}
                  onChange={handleChange}
                >
                  <option value="">Select option</option>
                  <option value="None">None</option>
                  <option value="Per Drawing Spec">Per Drawing Spec</option>
                  <option value="Model Specified">Model Specified</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="slideInRangeNotes">Notes</label>
                <textarea
                  id="slideInRangeNotes"
                  name="slideInRangeNotes"
                  value={formData.slideInRangeNotes}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </div>

            {/* Cooktop */}
            <div className="appliance-group">
              <h3 className="appliance-group-title">Cooktop</h3>
              <div className="form-group">
                <label htmlFor="cooktopModel">Model</label>
                <input
                  type="text"
                  id="cooktopModel"
                  name="cooktopModel"
                  value={formData.cooktopModel}
                  onChange={handleChange}
                  placeholder="Model number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="cooktopSpecOption">Spec Option</label>
                <select
                  id="cooktopSpecOption"
                  name="cooktopSpecOption"
                  value={formData.cooktopSpecOption}
                  onChange={handleChange}
                >
                  <option value="">Select option</option>
                  <option value="None">None</option>
                  <option value="Per Drawing Spec">Per Drawing Spec</option>
                  <option value="Model Specified">Model Specified</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="cooktopNotes">Notes</label>
                <textarea
                  id="cooktopNotes"
                  name="cooktopNotes"
                  value={formData.cooktopNotes}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </div>

            {/* Wall Oven */}
            <div className="appliance-group">
              <h3 className="appliance-group-title">Wall Oven</h3>
              <div className="form-group">
                <label htmlFor="wallOvenModel">Model</label>
                <input
                  type="text"
                  id="wallOvenModel"
                  name="wallOvenModel"
                  value={formData.wallOvenModel}
                  onChange={handleChange}
                  placeholder="Model number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="wallOvenSpecOption">Spec Option</label>
                <select
                  id="wallOvenSpecOption"
                  name="wallOvenSpecOption"
                  value={formData.wallOvenSpecOption}
                  onChange={handleChange}
                >
                  <option value="">Select option</option>
                  <option value="None">None</option>
                  <option value="Per Drawing Spec">Per Drawing Spec</option>
                  <option value="Model Specified">Model Specified</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="wallOvenNotes">Notes</label>
                <textarea
                  id="wallOvenNotes"
                  name="wallOvenNotes"
                  value={formData.wallOvenNotes}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </div>

            {/* Downdraft */}
            <div className="appliance-group">
              <h3 className="appliance-group-title">Downdraft</h3>
              <div className="form-group">
                <label htmlFor="downdraftModel">Model</label>
                <input
                  type="text"
                  id="downdraftModel"
                  name="downdraftModel"
                  value={formData.downdraftModel}
                  onChange={handleChange}
                  placeholder="Model number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="downdraftSpecOption">Spec Option</label>
                <select
                  id="downdraftSpecOption"
                  name="downdraftSpecOption"
                  value={formData.downdraftSpecOption}
                  onChange={handleChange}
                >
                  <option value="">Select option</option>
                  <option value="None">None</option>
                  <option value="Per Drawing Spec">Per Drawing Spec</option>
                  <option value="Model Specified">Model Specified</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="downdraftNotes">Notes</label>
                <textarea
                  id="downdraftNotes"
                  name="downdraftNotes"
                  value={formData.downdraftNotes}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </div>

            {/* Hood */}
            <div className="appliance-group">
              <h3 className="appliance-group-title">Hood</h3>
              <div className="form-group">
                <label htmlFor="hoodModel">Model</label>
                <input
                  type="text"
                  id="hoodModel"
                  name="hoodModel"
                  value={formData.hoodModel}
                  onChange={handleChange}
                  placeholder="Model number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="hoodSpecOption">Spec Option</label>
                <select
                  id="hoodSpecOption"
                  name="hoodSpecOption"
                  value={formData.hoodSpecOption}
                  onChange={handleChange}
                >
                  <option value="">Select option</option>
                  <option value="None">None</option>
                  <option value="Per Drawing Spec">Per Drawing Spec</option>
                  <option value="Model Specified">Model Specified</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="hoodNotes">Notes</label>
                <textarea
                  id="hoodNotes"
                  name="hoodNotes"
                  value={formData.hoodNotes}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </div>

            {/* Refrigerator */}
            <div className="appliance-group">
              <h3 className="appliance-group-title">Refrigerator</h3>
              <div className="form-group">
                <label htmlFor="refrigeratorModel">Model</label>
                <input
                  type="text"
                  id="refrigeratorModel"
                  name="refrigeratorModel"
                  value={formData.refrigeratorModel}
                  onChange={handleChange}
                  placeholder="Model number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="refrigeratorSpecOption">Spec Option</label>
                <select
                  id="refrigeratorSpecOption"
                  name="refrigeratorSpecOption"
                  value={formData.refrigeratorSpecOption}
                  onChange={handleChange}
                >
                  <option value="">Select option</option>
                  <option value="None">None</option>
                  <option value="Per Drawing Spec">Per Drawing Spec</option>
                  <option value="Model Specified">Model Specified</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="refrigeratorNotes">Notes</label>
                <textarea
                  id="refrigeratorNotes"
                  name="refrigeratorNotes"
                  value={formData.refrigeratorNotes}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </div>

            {/* Microwave Drawer */}
            <div className="appliance-group">
              <h3 className="appliance-group-title">Microwave Drawer</h3>
              <div className="form-group">
                <label htmlFor="microwaveDrawerModel">Model</label>
                <input
                  type="text"
                  id="microwaveDrawerModel"
                  name="microwaveDrawerModel"
                  value={formData.microwaveDrawerModel}
                  onChange={handleChange}
                  placeholder="Model number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="microwaveDrawerSpecOption">Spec Option</label>
                <select
                  id="microwaveDrawerSpecOption"
                  name="microwaveDrawerSpecOption"
                  value={formData.microwaveDrawerSpecOption}
                  onChange={handleChange}
                >
                  <option value="">Select option</option>
                  <option value="None">None</option>
                  <option value="Per Drawing Spec">Per Drawing Spec</option>
                  <option value="Model Specified">Model Specified</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="microwaveDrawerNotes">Notes</label>
                <textarea
                  id="microwaveDrawerNotes"
                  name="microwaveDrawerNotes"
                  value={formData.microwaveDrawerNotes}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </div>

            {/* Beverage Center / Ice Maker */}
            <div className="appliance-group">
              <h3 className="appliance-group-title">Beverage Center / Ice Maker</h3>
              <div className="form-group">
                <label htmlFor="beverageCenterModel">Model</label>
                <input
                  type="text"
                  id="beverageCenterModel"
                  name="beverageCenterModel"
                  value={formData.beverageCenterModel}
                  onChange={handleChange}
                  placeholder="Model number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="beverageCenterSpecOption">Spec Option</label>
                <select
                  id="beverageCenterSpecOption"
                  name="beverageCenterSpecOption"
                  value={formData.beverageCenterSpecOption}
                  onChange={handleChange}
                >
                  <option value="">Select option</option>
                  <option value="None">None</option>
                  <option value="Per Drawing Spec">Per Drawing Spec</option>
                  <option value="Model Specified">Model Specified</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="beverageCenterNotes">Notes</label>
                <textarea
                  id="beverageCenterNotes"
                  name="beverageCenterNotes"
                  value={formData.beverageCenterNotes}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </div>

            {/* Other Appliance */}
            <div className="appliance-group">
              <h3 className="appliance-group-title">Other</h3>
              <div className="form-group">
                <label htmlFor="otherApplianceDescription">Description</label>
                <input
                  type="text"
                  id="otherApplianceDescription"
                  name="otherApplianceDescription"
                  value={formData.otherApplianceDescription}
                  onChange={handleChange}
                  placeholder="Appliance description"
                />
              </div>
              <div className="form-group">
                <label htmlFor="otherApplianceModel">Model</label>
                <input
                  type="text"
                  id="otherApplianceModel"
                  name="otherApplianceModel"
                  value={formData.otherApplianceModel}
                  onChange={handleChange}
                  placeholder="Model number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="otherApplianceSpecOption">Spec Option</label>
                <select
                  id="otherApplianceSpecOption"
                  name="otherApplianceSpecOption"
                  value={formData.otherApplianceSpecOption}
                  onChange={handleChange}
                >
                  <option value="">Select option</option>
                  <option value="None">None</option>
                  <option value="Per Drawing Spec">Per Drawing Spec</option>
                  <option value="Model Specified">Model Specified</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="otherApplianceNotes">Notes</label>
                <textarea
                  id="otherApplianceNotes"
                  name="otherApplianceNotes"
                  value={formData.otherApplianceNotes}
                  onChange={handleChange}
                  rows={2}
                />
              </div>
            </div>

            <div className="form-group">
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
              <label htmlFor="fillersAndOverhangsSpec">Fillers and Overhangs Spec</label>
              <select
                id="fillersAndOverhangsSpec"
                name="fillersAndOverhangsSpec"
                value={formData.fillersAndOverhangsSpec}
                onChange={handleChange}
              >
                <option value="">Select option</option>
                <option value="None">None</option>
                <option value="Per Drawing Spec">Per Drawing Spec</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fillersAndOverhangsNotes">Fillers and Overhangs Notes</label>
              <textarea
                id="fillersAndOverhangsNotes"
                name="fillersAndOverhangsNotes"
                value={formData.fillersAndOverhangsNotes}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="outOfSquareOrScribing">Out of Square or Scribing</label>
              <select
                id="outOfSquareOrScribing"
                name="outOfSquareOrScribing"
                value={formData.outOfSquareOrScribing}
                onChange={handleChange}
              >
                <option value="">Select option</option>
                <option value="None">None</option>
                <option value="Yes (see notes)">Yes (see notes)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="outOfSquareNotes">Out of Square Notes</label>
              <textarea
                id="outOfSquareNotes"
                name="outOfSquareNotes"
                value={formData.outOfSquareNotes}
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
                <option value="">Select option</option>
                <option value="Not required (overhang ≤ 10–12&quot;)">Not required (overhang ≤ 10–12")</option>
                <option value="Required (corbels, steel bars, brackets)">Required (corbels, steel bars, brackets)</option>
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
                  name="radiusCorners"
                  checked={formData.radiusCorners}
                  onChange={handleChange}
                />
                <span>Radius corners</span>
              </label>

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
                  name="seamPreferences"
                  checked={formData.seamPreferences}
                  onChange={handleChange}
                />
                <span>Seam preferences</span>
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
                If a sink cutout template is provided without the physical sink present, Bella Stone cannot guarantee sink fitment. The general contractor assumes all responsibility for fitment. Standard reveal is .25–.35" overhang on undermount sinks.
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

