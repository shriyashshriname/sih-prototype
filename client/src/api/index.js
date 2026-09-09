import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Habitations (replaces villages)
export const getHabitations       = ()      => api.get('/habitations');
export const getHabitation        = (id)    => api.get(`/habitations/${id}`);
export const searchHabitations    = (q)     => api.get(`/habitations/search?q=${encodeURIComponent(q)}`);

// Legacy compatibility
export const getVillages          = ()      => api.get('/habitations');
export const getVillage           = (id)    => api.get(`/habitations/${id}`);
export const searchVillages       = (q)     => api.get(`/habitations/search?q=${encodeURIComponent(q)}`);

// Risk summary
export const getRiskSummary       = ()      => api.get('/risk/summary');

// Red zones
export const getRedZones          = ()      => api.get('/red-zones');

// Relocation
export const getRelocationPriority = ()     => api.get('/relocation/priority');
export const getRelocationSites   = ()      => api.get('/relocation-sites');
export const getRelocationSite    = (id)    => api.get(`/relocation-sites/${id}`);
export const getSiteCapacity      = (id, required) => api.get(`/relocation-sites/${id}/capacity?required=${required}`);

// Geographic-first recommendation matching
export const getRelocationMatching = (habitationId, params = {}) => 
  api.get('/relocation/sites', { params: { habitationId, ...params } });
export const recommendSites       = (habitationId, params = {}) => 
  api.get('/relocation/sites', { params: { habitationId, ...params } });

export const createRelocationPlan = (data) => {
  if (typeof data === 'string') {
    // legacy call signature createRelocationPlan(habitationId, siteId)
    return api.post('/relocation/plan', { habitationId: arguments[0], siteId: arguments[1] });
  }
  return api.post('/relocation/plan', data);
};

export const getRelocationPlans   = ()      => api.get('/relocation/plans');
export const getRelocationPlan    = (id)    => api.get(`/relocation/plans/${id}`);
export const submitPlan           = (id, submittedBy) => api.put(`/relocation/plan/${id}/submit`, { submittedBy });
export const approvePlan          = (id, approvedBy)  => api.put(`/relocation/plan/${id}/approve`, { approvedBy });

// Alerts
export const getAlerts            = (params = {}) => api.get('/alerts', { params });
export const simulateAlerts       = (id)           => api.post(`/alerts/simulate/${id}`);
export const acknowledgeAlert     = (id, by)       => api.put(`/alerts/${id}/acknowledge`, { acknowledged_by: by });
export const resolveAlert         = (id)           => api.put(`/alerts/${id}/resolve`);

export default api;
