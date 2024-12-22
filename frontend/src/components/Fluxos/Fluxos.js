import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import api from '../../services/api';

const Fluxos = () => {
    const [fluxos, setFluxos] = useState([]);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        titulo: '',
        descricao: '',
        etapas: ''
    });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadFluxos();
    }, []);

    const loadFluxos = async () => {
        try {
            const response = await api.get('/fluxos');
            setFluxos(response.data);
        } catch (err) {
            setError('Erro ao carregar fluxos');
        }
    };

    const handleOpen = (fluxo = null) => {
        if (fluxo) {
            setFormData({
                titulo: fluxo.titulo,
                descricao: fluxo.descricao,
                etapas: fluxo.etapas
            });
            setEditingId(fluxo.id);
        } else {
            setFormData({
                titulo: '',
                descricao: '',
                etapas: ''
            });
            setEditingId(null);
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setFormData({
            titulo: '',
            descricao: '',
            etapas: ''
        });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/fluxos/${editingId}`, formData);
            } else {
                await api.post('/fluxos', formData);
            }
            handleClose();
            loadFluxos();
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao salvar fluxo');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este fluxo?')) {
            try {
                await api.delete(`/fluxos/${id}`);
                loadFluxos();
            } catch (err) {
                setError('Erro ao excluir fluxo');
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Gestão de Fluxos</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                >
                    Novo Fluxo
                </Button>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Título</TableCell>
                            <TableCell>Descrição</TableCell>
                            <TableCell>Etapas</TableCell>
                            <TableCell>Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fluxos.map((fluxo) => (
                            <TableRow key={fluxo.id}>
                                <TableCell>{fluxo.titulo}</TableCell>
                                <TableCell>{fluxo.descricao}</TableCell>
                                <TableCell>{fluxo.etapas}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpen(fluxo)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(fluxo.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    {editingId ? 'Editar Fluxo' : 'Novo Fluxo'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 1 }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Título"
                            name="titulo"
                            value={formData.titulo}
                            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Descrição"
                            name="descricao"
                            multiline
                            rows={4}
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Etapas"
                            name="etapas"
                            multiline
                            rows={4}
                            value={formData.etapas}
                            onChange={(e) => setFormData({ ...formData, etapas: e.target.value })}
                            helperText="Digite as etapas separadas por vírgula"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Fluxos;
