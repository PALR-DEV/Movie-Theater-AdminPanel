import Swal from 'sweetalert2';

const AlertUtils = {
    showSuccess: (message) => {
        return Swal.fire({
            title: 'Success!',
            text: message,
            icon: 'success',
            confirmButtonColor: '#000000',
            confirmButtonText: 'OK'
        });
    },

    showError: (message) => {
        return Swal.fire({
            title: 'Error!',
            text: message,
            icon: 'error',
            confirmButtonColor: '#000000',
            confirmButtonText: 'OK'
        });
    },

    showConfirm: (title, text) => {
        return Swal.fire({
            title: title,
            text: text,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#000000',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        });
    },

    showLoading: (message = 'Loading...') => {
        Swal.fire({
            title: message,
            allowOutsideClick: false,
            showConfirmButton: false,
            willOpen: () => {
                Swal.showLoading();
            }
        });
    },

    closeLoading: () => {
        Swal.close();
    }
};

export default AlertUtils;