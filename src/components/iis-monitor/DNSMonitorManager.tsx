import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  Globe,
} from 'lucide-react';
import { dnsConfigService } from '@/services';
import type { DNSConfigResponse, MonitoringControlResponse } from '@/types';


interface DNSControlProps {
  controlDNS: MonitoringControlResponse | null;
}

const DNSMonitorManager: React.FC<DNSControlProps> = ({
  controlDNS,
}) => {
  const [domains, setDomains] = useState<DNSConfigResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<DNSConfigResponse | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    dns: '',
    expected_ip: '',
    status: true
  });

  // Cargar datos
  useEffect(() => {
    handleDNSConfig();
  }, []);

  const handleDNSConfig = async () => {
    setLoading(true);
    try {
      const result = await dnsConfigService.getDNSConfigStatus();
      setDomains(result);
    } catch (error) {
      console.error('Error loading domains:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar dominios
  const filteredDomains = domains.filter(domain =>
    domain.dns.toLowerCase().includes(searchTerm.toLowerCase()) ||
    domain.expected_ip.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Modal handlers
  const handleAdd = () => {
    setEditingDomain(null);
    setFormData({
      id: '',
      dns: '',
      expected_ip: '',
      status: true
    });
    setModalOpen(true);
  };

  const handleEdit = (domain: DNSConfigResponse) => {
    setEditingDomain(domain);
    setFormData({
      id: domain.id,
      dns: domain.dns,
      expected_ip: domain.expected_ip,
      status: domain.status
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.dns || !formData.expected_ip) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      if (editingDomain) {
        await dnsConfigService.updateDomain(editingDomain.id, formData)
        await handleDNSConfig();
      } else {
        await dnsConfigService.createDNSConfig(formData)
        await handleDNSConfig();
      }

      setModalOpen(false);
    } catch (err) {
      alert('Error al guardar');
      console.error(err);
    }
  };

  const handleDelete = async (domain: DNSConfigResponse) => {
    if (!confirm('¿Estás seguro de eliminar este dominio?')) return;

    try {
      await dnsConfigService.deleteDNSConfig(domain.dns);
      await handleDNSConfig();
    } catch (err) {
      alert('Error al eliminar');
      console.error(err);
    }
  };

  // Estadísticas
  const activeCount = domains.filter(d => d.status).length;
  const inactiveCount = domains.length - activeCount;

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Dominios</p>
                <p className="text-2xl font-bold">{domains.length}</p>
              </div>
              <Globe className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="text-2xl font-bold text-green-600">{activeCount}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Inactivos</p>
                <p className="text-2xl font-bold text-red-600">{inactiveCount}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de Dominios */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Dominios Monitoreados</CardTitle>
              <CardDescription>
                Gestiona los dominios DNS que deseas monitorear
              </CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar dominio o IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Button
                onClick={handleAdd}
                className="flex items-center gap-2"
                disabled={controlDNS?.is_running}
              >
                <Plus className="w-4 h-4" />
                Agregar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDomains.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Globe className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No hay dominios configurados</p>
              <p className="text-sm">Haz clic en "Agregar" para comenzar</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estado</TableHead>
                    <TableHead>Dominio DNS</TableHead>
                    <TableHead>IP Esperada</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDomains.map((domain, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge
                          variant={domain.status ? "default" : "destructive"}
                          className={domain.status ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                        >
                          {domain.status ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{domain.dns}</TableCell>
                      <TableCell>
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-medium">
                          {domain.expected_ip}
                        </code>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(domain)}
                            disabled={controlDNS?.is_running}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(domain)}
                            disabled={controlDNS?.is_running}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para Agregar/Editar */}
      <AlertDialog open={modalOpen} onOpenChange={setModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {editingDomain ? 'Editar Dominio' : 'Agregar Dominio'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {editingDomain
                ? 'Modifica la información del dominio DNS'
                : 'Agrega un nuevo dominio DNS para monitorear'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="dns" className="text-sm font-medium">
                Dominio DNS
              </label>
              <Input
                id="dns"
                placeholder="ejemplo.unamad.edu.pe"
                value={formData.dns}
                onChange={(e) => setFormData({ ...formData, dns: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="ip" className="text-sm font-medium">
                IP Esperada
              </label>
              <Input
                id="ip"
                placeholder="110.238.69.0"
                value={formData.expected_ip}
                onChange={(e) => setFormData({ ...formData, expected_ip: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="status"
                checked={formData.status}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, status: checked as boolean })
                }
              />
              <label
                htmlFor="status"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Activo
              </label>
            </div>
          </div>

          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingDomain ? 'Actualizar' : 'Guardar'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DNSMonitorManager;
