import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Mail, Save, Plus, Trash2, Users, Settings } from 'lucide-react';
import { emailConfigService } from '@/services';
import type { EmailConfig, NotificationEmail } from '@/types';

interface EmailConfigManagerProps {
  isConnected: boolean;
}

const EmailConfigManager: React.FC<EmailConfigManagerProps> = ({
  isConnected,
}) => {
  const [senderConfig, setSenderConfig] = useState<EmailConfig | null>(null);
  const [notificationEmails, setNotificationEmails] = useState<NotificationEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Estado para el formulario del correo remitente
  const [senderForm, setSenderForm] = useState({
    email: '',
    gmail_app_password: '',
  });

  // Estado para el formulario de correos a notificar
  const [notificationForm, setNotificationForm] = useState({
    email: ''
  });

  useEffect(() => {
    loadEmailConfig();
  }, []);

  const loadEmailConfig = async () => {
    setLoading(true);
    try {
      // Cargar configuración del remitente
      const senderResult = await emailConfigService.getSenderConfig();
      if (senderResult) {
        setSenderConfig(senderResult);
        setSenderForm({
          email: senderResult.email || '',
          gmail_app_password: '',
        });
      }

      // Cargar lista de correos a notificar
      const emailsResult = await emailConfigService.getNotificationEmails();
      setNotificationEmails(emailsResult || []);
    } catch (error) {
      console.error('Error loading email config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSender = async () => {
    if (!senderForm.email || !senderForm.gmail_app_password) {
      alert('Por favor completa tanto el correo como la contraseña de aplicación');
      return;
    }

    setSaving(true);
    try {
      const result = await emailConfigService.updateSenderConfig(senderForm);
      if (result.success) {
        await loadEmailConfig();
        alert('Correo remitente guardado exitosamente');
      } else {
        alert('Error al guardar: ' + (result.message || ''));
      }
    } catch (error) {
      console.error('Error saving sender config:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNotificationEmail = async () => {
    if (!notificationForm.email) {
      alert('Por favor ingresa un correo electrónico');
      return;
    }

    try {
      const result = await emailConfigService.addNotificationEmail(notificationForm.email);
      if (result.success) {
        setNotificationForm({ email: '' });
        await loadEmailConfig();
        alert('Correo agregado exitosamente');
      } else {
        alert('Error al agregar correo: ' + (result.message || ''));
      }
    } catch (error) {
      console.error('Error adding notification email:', error);
      alert('Error al agregar correo');
    }
  };

  const handleRemoveNotificationEmail = async (email: string) => {
    if (!confirm('¿Estás seguro de eliminar este correo de la lista de notificaciones?')) return;

    try {
      console.log(email)
      const result = await emailConfigService.removeNotificationEmail(email);
      if (result.success) {
        await loadEmailConfig();
        alert('Correo eliminado exitosamente');
      } else {
        alert('Error al eliminar correo');
      }
    } catch (error) {
      console.error('Error removing notification email:', error);
      alert('Error al eliminar correo');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sección 1: Configuración del Correo Remitente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Correo Remitente (Gmail)
          </CardTitle>
          <CardDescription>
            Configura el correo Gmail que enviará las notificaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sender-email">Correo Gmail *</Label>
              <Input
                id="sender-email"
                type="email"
                placeholder="tu.correo@gmail.com"
                value={senderForm.email}
                onChange={(e) => setSenderForm({ ...senderForm, email: e.target.value })}
                disabled={!isConnected}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="app-password">Contraseña de Aplicación *</Label>
              <Input
                id="app-password"
                type="password"
                placeholder="Ingresa tu contraseña de aplicación"
                value={senderForm.gmail_app_password}
                onChange={(e) => setSenderForm({ ...senderForm, gmail_app_password: e.target.value })}
                disabled={!isConnected}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSaveSender}
              disabled={saving || !isConnected}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar Correo Remitente'}
            </Button>

            {senderConfig && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Configurado
              </Badge>
            )}
          </div>

          {/* Información sobre contraseñas de aplicación */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 text-sm mb-1">
              ¿Cómo obtener la contraseña de aplicación?
            </h4>
            <p className="text-xs text-blue-700">
              Ve a tu cuenta de Google → Seguridad → Verificación en 2 pasos → Contraseñas de aplicación
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Sección 2: Correos a Notificar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Correos para Notificaciones
          </CardTitle>
          <CardDescription>
            Gestiona la lista de correos que recibirán las alertas de monitoreo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formulario para agregar correo */}
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="notification-email" className="pb-3">Agregar correo para notificaciones</Label>
              <Input
                id="notification-email"
                type="email"
                placeholder="correo@dominio.com"
                value={notificationForm.email}
                onChange={(e) => setNotificationForm({ email: e.target.value })}
                disabled={!isConnected}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAddNotificationEmail}
                disabled={!isConnected}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </Button>
            </div>
          </div>

          {/* Lista de correos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Correos registrados ({notificationEmails.length})
              </span>
            </div>

            {notificationEmails.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay correos registrados</p>
                <p className="text-sm">Agrega correos para recibir notificaciones</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                {notificationEmails.map((notificationEmail, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border-b last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{notificationEmail.email}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveNotificationEmail(notificationEmail.email)}
                      disabled={!isConnected}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailConfigManager;
