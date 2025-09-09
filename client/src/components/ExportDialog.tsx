import React from 'react';
import {

Dialog,
DialogTitle,
DialogContent,
DialogActions,
Button,
Typography,
CircularProgress,
} from '@mui/material';

interface ExportDialogProps {
open: boolean;
onClose: () => void;
onExport: () => void;
loading?: boolean;
error?: string | null;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
open,
onClose,
onExport,
loading = false,
error = null,
}) => {
return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>Export Data</DialogTitle>
        <DialogContent>
            <Typography>
                Are you sure you want to export the event data?
            </Typography>
            {error && (
                <Typography color="error" variant="body2" sx={{ mt: 2 }}>
                    {error}
                </Typography>
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose} disabled={loading}>
                Cancel
            </Button>
            <Button
                onClick={onExport}
                color="primary"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
            >
                Export
            </Button>
        </DialogActions>
    </Dialog>
);
};

export default ExportDialog;