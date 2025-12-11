import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import './MeasurementRequests.css';

interface MeasurementRequest {
  id: string;
  customerName: string;
  jobsiteAddress: string;
  contactPhone: string;
  requestedInstallDate: string;
  generalNotes?: string;
  sinks?: any[];
  faucetAndAccessories?: any;
  grommets?: any;
  backsplash?: any;
  appliances?: any;
  cabinetLayout?: any;
  specialRequests?: any;
  acknowledgements?: any;
  status?: string;
  createdAt: any;
}

const MeasurementRequests = () => {
  const [requests, setRequests] = useState<MeasurementRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<MeasurementRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchMeasurementRequests();
  }, [filterStatus]);

  const fetchMeasurementRequests = async () => {
    try {
      const requestsRef = collection(db, 'measurementRequests');
      const requestsQuery = query(requestsRef, orderBy('createdAt', 'desc'));
      
      const snapshot = await getDocs(requestsQuery);
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MeasurementRequest[];

      const filtered = filterStatus === 'all' 
        ? fetched 
        : fetched.filter(req => (req.status || 'new') === filterStatus);
      
      setRequests(filtered);
    } catch (error) {
      console.error('Error fetching measurement requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'measurementRequests', id), {
        status: newStatus,
        updatedAt: new Date()
      });
      fetchMeasurementRequests();
      if (selectedRequest?.id === id) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating measurement request status:', error);
      alert('Failed to update status');
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this measurement request?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'measurementRequests', id));
      fetchMeasurementRequests();
      if (selectedRequest?.id === id) {
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error('Error deleting measurement request:', error);
      alert('Failed to delete measurement request');
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="loading">Loading measurement requests...</div>;
  }

  return (
    <div className="measurement-requests">
      <div className="measurement-requests-header">
        <h2>Measurement Requests</h2>
        <div className="status-filter">
          <button
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${filterStatus === 'new' ? 'active' : ''}`}
            onClick={() => setFilterStatus('new')}
          >
            New
          </button>
          <button
            className={`filter-btn ${filterStatus === 'in-progress' ? 'active' : ''}`}
            onClick={() => setFilterStatus('in-progress')}
          >
            In Progress
          </button>
          <button
            className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
            onClick={() => setFilterStatus('completed')}
          >
            Completed
          </button>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <p>No measurement requests found.</p>
        </div>
      ) : (
        <div className="measurement-requests-container">
          <div className="measurement-requests-list">
            {requests.map((request) => (
              <div
                key={request.id}
                className={`measurement-request-card ${selectedRequest?.id === request.id ? 'selected' : ''} status-${request.status || 'new'}`}
                onClick={() => setSelectedRequest(request)}
              >
                <div className="request-card-header">
                  <h3>{request.customerName || 'Unknown Customer'}</h3>
                  <span className={`status-badge status-${request.status || 'new'}`}>
                    {request.status || 'new'}
                  </span>
                </div>
                <div className="request-card-info">
                  <p><strong>Jobsite:</strong> {request.jobsiteAddress}</p>
                  <p><strong>Phone:</strong> {request.contactPhone}</p>
                  <p><strong>Install Date:</strong> {request.requestedInstallDate || 'Not specified'}</p>
                  <p><strong>Created:</strong> {formatDate(request.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>

          {selectedRequest && (
            <div className="measurement-request-detail">
              <div className="detail-header">
                <h3>Measurement Checklist - {selectedRequest.customerName}</h3>
                <button className="close-detail" onClick={() => setSelectedRequest(null)}>×</button>
              </div>

              <div className="detail-content">
                {/* Project Information */}
                <div className="detail-section">
                  <h4>Project Information</h4>
                  <div className="detail-grid">
                    <div><strong>Customer Name:</strong> {selectedRequest.customerName}</div>
                    <div><strong>Jobsite Address:</strong> {selectedRequest.jobsiteAddress}</div>
                    <div><strong>Contact Phone:</strong> <a href={`tel:${selectedRequest.contactPhone}`}>{selectedRequest.contactPhone}</a></div>
                    <div><strong>Requested Install Date:</strong> {selectedRequest.requestedInstallDate || 'Not specified'}</div>
                    <div><strong>Status:</strong> 
                      <select
                        value={selectedRequest.status || 'new'}
                        onChange={(e) => updateStatus(selectedRequest.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="new">New</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div><strong>Submitted:</strong> {formatDate(selectedRequest.createdAt)}</div>
                  </div>
                  {selectedRequest.generalNotes && (
                    <div style={{ marginTop: '1rem' }}>
                      <strong>General Notes:</strong>
                      <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{selectedRequest.generalNotes}</p>
                    </div>
                  )}
                </div>

                {/* Sink Information */}
                {selectedRequest.sinks && selectedRequest.sinks.length > 0 && (
                  <div className="detail-section">
                    <h4>Sink Information ({selectedRequest.sinks.length} sink{selectedRequest.sinks.length !== 1 ? 's' : ''})</h4>
                    {selectedRequest.sinks.map((sink, index) => (
                      <div key={index} className="nested-item">
                        <h5>Sink {index + 1}</h5>
                        <div className="detail-grid">
                          <div><strong>Location:</strong> {sink.location || 'N/A'}</div>
                          <div><strong>Type:</strong> {sink.type || 'N/A'}</div>
                          <div><strong>Manufacturer/Model:</strong> {sink.manufacturerModel || 'N/A'}</div>
                          <div><strong>Cutout Template:</strong> {sink.cutoutTemplateProvided || 'N/A'}</div>
                          <div><strong>Physical Sink On Site:</strong> {sink.physicalSinkOnSite || 'N/A'}</div>
                          <div><strong>Reveal Preference:</strong> {sink.revealPreference || 'N/A'}</div>
                        </div>
                        {sink.sinkNotes && (
                          <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}><strong>Notes:</strong> {sink.sinkNotes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Faucet & Accessories */}
                {selectedRequest.faucetAndAccessories && (
                  <div className="detail-section">
                    <h4>Faucet & Accessory Holes</h4>
                    <div className="detail-grid">
                      <div><strong>Faucet Hole Spec:</strong> {selectedRequest.faucetAndAccessories.faucetHoleSpec || 'N/A'}</div>
                      {selectedRequest.faucetAndAccessories.faucetHoleSpec === 'Custom (use counts below)' && (
                        <>
                          <div><strong>Main Faucet:</strong> {selectedRequest.faucetAndAccessories.mainFaucetCount || 0}</div>
                          <div><strong>Sprayer:</strong> {selectedRequest.faucetAndAccessories.sprayerCount || 0}</div>
                          <div><strong>Soap Dispenser:</strong> {selectedRequest.faucetAndAccessories.soapDispenserCount || 0}</div>
                          <div><strong>Air Gap:</strong> {selectedRequest.faucetAndAccessories.airGapCount || 0}</div>
                          <div><strong>RO Faucet:</strong> {selectedRequest.faucetAndAccessories.roFaucetCount || 0}</div>
                          <div><strong>Hot Water Tap:</strong> {selectedRequest.faucetAndAccessories.hotWaterTapCount || 0}</div>
                          {selectedRequest.faucetAndAccessories.otherDescription && (
                            <div><strong>Other ({selectedRequest.faucetAndAccessories.otherDescription}):</strong> {selectedRequest.faucetAndAccessories.otherCount || 0}</div>
                          )}
                        </>
                      )}
                    </div>
                    {selectedRequest.faucetAndAccessories.faucetSpacingNotes && (
                      <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}><strong>Spacing Notes:</strong> {selectedRequest.faucetAndAccessories.faucetSpacingNotes}</p>
                    )}
                  </div>
                )}

                {/* Grommets */}
                {selectedRequest.grommets && (
                  <div className="detail-section">
                    <h4>Grommet Hole Locations</h4>
                    <div className="detail-grid">
                      <div><strong>Submission Method:</strong> {selectedRequest.grommets.submissionMethod || 'N/A'}</div>
                    </div>
                    {selectedRequest.grommets.locations && selectedRequest.grommets.locations.length > 0 && (
                      <div style={{ marginTop: '1rem' }}>
                        <strong>Grommet Locations ({selectedRequest.grommets.locations.length}):</strong>
                        {selectedRequest.grommets.locations.map((grommet: any, index: number) => (
                          <div key={index} className="nested-item">
                            <h5>{grommet.label || `Grommet ${index + 1}`}</h5>
                            <div className="detail-grid">
                              <div><strong>Size:</strong> {grommet.sizeInches || 'N/A'}"</div>
                              <div><strong>Coordinates:</strong> {grommet.coordinates || 'N/A'}</div>
                            </div>
                            {grommet.grommetNotes && (
                              <p style={{ marginTop: '0.5rem' }}><strong>Notes:</strong> {grommet.grommetNotes}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Backsplash */}
                {selectedRequest.backsplash && (
                  <div className="detail-section">
                    <h4>Backsplash Requirements</h4>
                    <div className="detail-grid">
                      <div><strong>Splash Needed:</strong> {selectedRequest.backsplash.splashNeeded || 'N/A'}</div>
                      <div><strong>Splash Height:</strong> {selectedRequest.backsplash.splashHeight || 'N/A'}</div>
                    </div>
                    {selectedRequest.backsplash.obstructions && (
                      <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}><strong>Obstructions:</strong> {selectedRequest.backsplash.obstructions}</p>
                    )}
                  </div>
                )}

                {/* Appliances */}
                {selectedRequest.appliances && (
                  <div className="detail-section">
                    <h4>Appliance Specs & Cutouts</h4>
                    {selectedRequest.appliances.items && selectedRequest.appliances.items.length > 0 ? (
                      <>
                        {selectedRequest.appliances.items.map((appliance: any, index: number) => (
                          <div key={index} className="nested-item">
                            <h5>Appliance {index + 1}</h5>
                            <div className="detail-grid">
                              <div><strong>Type:</strong> {appliance.type || 'N/A'}</div>
                              <div><strong>Model:</strong> {appliance.model || 'N/A'}</div>
                              <div><strong>Spec Option:</strong> {appliance.specOption || 'N/A'}</div>
                            </div>
                            {appliance.specLink && (
                              <p style={{ marginTop: '0.5rem' }}>
                                <strong>Spec Link:</strong>{' '}
                                <a href={appliance.specLink} target="_blank" rel="noopener noreferrer" style={{ color: '#4a9eff' }}>
                                  {appliance.specLink}
                                </a>
                              </p>
                            )}
                            {appliance.specDocumentUrl && (
                              <p style={{ marginTop: '0.5rem' }}>
                                <strong>Spec Document:</strong>{' '}
                                <a href={appliance.specDocumentUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#4a9eff' }}>
                                  View Document
                                </a>
                              </p>
                            )}
                            {appliance.notes && (
                              <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}><strong>Notes:</strong> {appliance.notes}</p>
                            )}
                          </div>
                        ))}
                        {selectedRequest.appliances.applianceClearancesNotes && (
                          <div style={{ marginTop: '1rem' }}>
                            <strong>Clearances Notes:</strong>
                            <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{selectedRequest.appliances.applianceClearancesNotes}</p>
                          </div>
                        )}
                      </>
                    ) : (
                      // Fallback for old format (backward compatibility)
                      <>
                        {Object.entries(selectedRequest.appliances).map(([key, appliance]: [string, any]) => {
                          if (key === 'applianceClearancesNotes' || key === 'items' || !appliance || typeof appliance !== 'object') return null;
                          if (appliance.specOption === 'None' || appliance.specOption === 'Per Drawing Spec') {
                            return (
                              <div key={key} className="appliance-item">
                                <strong>{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> {appliance.specOption || 'N/A'}
                              </div>
                            );
                          }
                          return (
                            <div key={key} className="appliance-item">
                              <h5>{key.replace(/([A-Z])/g, ' $1').trim()}</h5>
                              <div className="detail-grid">
                                <div><strong>Model:</strong> {appliance.model || 'N/A'}</div>
                                <div><strong>Spec Option:</strong> {appliance.specOption || 'N/A'}</div>
                              </div>
                              {appliance.specLink && (
                                <p style={{ marginTop: '0.5rem' }}>
                                  <strong>Spec Link:</strong>{' '}
                                  <a href={appliance.specLink} target="_blank" rel="noopener noreferrer" style={{ color: '#4a9eff' }}>
                                    {appliance.specLink}
                                  </a>
                                </p>
                              )}
                              {appliance.specDocumentUrl && (
                                <p style={{ marginTop: '0.5rem' }}>
                                  <strong>Spec Document:</strong>{' '}
                                  <a href={appliance.specDocumentUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#4a9eff' }}>
                                    View Document
                                  </a>
                                </p>
                              )}
                              {appliance.notes && (
                                <p style={{ marginTop: '0.5rem' }}><strong>Notes:</strong> {appliance.notes}</p>
                              )}
                            </div>
                          );
                        })}
                        {selectedRequest.appliances.applianceClearancesNotes && (
                          <div style={{ marginTop: '1rem' }}>
                            <strong>Clearances Notes:</strong>
                            <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{selectedRequest.appliances.applianceClearancesNotes}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Cabinet Layout */}
                {selectedRequest.cabinetLayout && (
                  <div className="detail-section">
                    <h4>Cabinet Layout Notes</h4>
                    <div className="detail-grid">
                      <div><strong>Cabinets Installed and Level:</strong> {selectedRequest.cabinetLayout.cabinetsInstalledAndLevel || 'N/A'}</div>
                      <div><strong>Fillers and Overhangs Spec:</strong> {selectedRequest.cabinetLayout.fillersAndOverhangsSpec || 'N/A'}</div>
                      <div><strong>Out of Square or Scribing:</strong> {selectedRequest.cabinetLayout.outOfSquareOrScribing || 'N/A'}</div>
                      <div><strong>Island Overhang Reinforcement:</strong> {selectedRequest.cabinetLayout.islandOverhangReinforcement || 'N/A'}</div>
                    </div>
                    {selectedRequest.cabinetLayout.fillersAndOverhangsNotes && (
                      <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}><strong>Fillers/Overhangs Notes:</strong> {selectedRequest.cabinetLayout.fillersAndOverhangsNotes}</p>
                    )}
                    {selectedRequest.cabinetLayout.outOfSquareNotes && (
                      <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}><strong>Out of Square Notes:</strong> {selectedRequest.cabinetLayout.outOfSquareNotes}</p>
                    )}
                    {selectedRequest.cabinetLayout.islandOverhangNotes && (
                      <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}><strong>Island Overhang Notes:</strong> {selectedRequest.cabinetLayout.islandOverhangNotes}</p>
                    )}
                  </div>
                )}

                {/* Special Requests */}
                {selectedRequest.specialRequests && (
                  <div className="detail-section">
                    <h4>Unique / Special Requests</h4>
                    <div className="special-requests-checklist">
                      {selectedRequest.specialRequests.radiusCorners && <div>✓ Radius corners</div>}
                      {selectedRequest.specialRequests.waterfallEdges && <div>✓ Waterfall edges</div>}
                      {selectedRequest.specialRequests.miteredEdges && <div>✓ Mitered edges</div>}
                      {selectedRequest.specialRequests.seamPreferences && <div>✓ Seam preferences</div>}
                      {selectedRequest.specialRequests.extendedOverhangs && <div>✓ Extended overhangs</div>}
                      {selectedRequest.specialRequests.floatingShelves && <div>✓ Floating shelves / hidden brackets</div>}
                      {selectedRequest.specialRequests.embeddedChannelsLightingCharging && <div>✓ Embedded channels / lighting / charging stations</div>}
                      {selectedRequest.specialRequests.expeditedDelivery && <div>✓ Expedited delivery</div>}
                      {selectedRequest.specialRequests.none && <div>✓ None</div>}
                      {selectedRequest.specialRequests.perDrawingSpec && <div>✓ Per Drawing Spec</div>}
                    </div>
                    {selectedRequest.specialRequests.specialRequestsNotes && (
                      <p style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}><strong>Notes:</strong> {selectedRequest.specialRequests.specialRequestsNotes}</p>
                    )}
                  </div>
                )}

                {/* Acknowledgements */}
                {selectedRequest.acknowledgements && (
                  <div className="detail-section">
                    <h4>Disclaimers</h4>
                    <p><strong>Acknowledged:</strong> {selectedRequest.acknowledgements.acknowledgeDisclaimers ? 'Yes' : 'No'}</p>
                  </div>
                )}

                <div className="detail-actions">
                  <button
                    className="btn-delete"
                    onClick={() => deleteRequest(selectedRequest.id)}
                  >
                    Delete Measurement Request
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MeasurementRequests;

