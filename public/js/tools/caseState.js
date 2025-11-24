import {showTemporaryAlert} from './alerts.js';
export async function cases(res, suppressAlert = false) {
    if (!res.ok) {
        if (!suppressAlert) { 
            switch (res.status) {
                case 403:
                    showTemporaryAlert('alert', 'You do not have permission');
                    break;
                case 404:
                    showTemporaryAlert('alert', 'No data found');
                    break;
                case 401:
                    showTemporaryAlert('alert', 'Unauthorized');
                    break;
                default:
                    showTemporaryAlert('alert', 'Failed to fetch');
                     break;
            }
        }
        return false;
    }
    return true;
}