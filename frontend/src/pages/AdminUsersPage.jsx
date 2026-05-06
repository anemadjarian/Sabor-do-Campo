import { useEffect, useMemo, useState } from 'react';
import { deleteUserById, fetchUserById, fetchUsers } from '../services/adminUserService';

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(true);

  const adminUsers = useMemo(
    () => users.filter((user) => user.role === 'ROLE_ADMIN').length,
    [users]
  );

  async function loadUsers() {
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const data = await fetchUsers();
      setUsers(data ?? []);
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleInspect(userId) {
    try {
      const data = await fetchUserById(userId);
      setSelectedUser(data);
      setStatus({ type: '', message: '' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  }

  async function handleDelete(userId) {
    const shouldDelete = window.confirm('Deseja deletar este usuario?');
    if (!shouldDelete) return;

    try {
      await deleteUserById(userId);
      setSelectedUser((current) => (current?.id === userId ? null : current));
      await loadUsers();
      setStatus({ type: 'success', message: 'Usuario removido com sucesso.' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  }

  return (
    <section className="admin-users-page">
      <div className="admin-users-header">
        <div>
          <p className="eyebrow">Painel interno</p>
          <h2>Usuarios</h2>
        </div>

        <div className="admin-stats">
          <div>
            <strong>{users.length}</strong>
            <span>Total</span>
          </div>
          <div>
            <strong>{adminUsers}</strong>
            <span>Admins</span>
          </div>
        </div>
      </div>

      {status.message ? (
        <p className={status.type === 'success' ? 'status-message success' : 'status-message error'}>
          {status.message}
        </p>
      ) : null}

      <div className="admin-users-layout">
        <div className="admin-users-table-wrap">
          {isLoading ? (
            <p className="muted-message">Carregando usuarios...</p>
          ) : (
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Perfil</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role === 'ROLE_ADMIN' ? 'Admin' : 'Cliente'}</td>
                    <td>
                      <div className="admin-table-actions">
                        <button type="button" onClick={() => handleInspect(user.id)}>
                          Verificar
                        </button>
                        <button
                          type="button"
                          className="danger-button"
                          disabled={user.email === 'admin@sabordocampo.com'}
                          onClick={() => handleDelete(user.id)}
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <aside className="admin-user-detail">
          <p className="eyebrow">Detalhes</p>
          {selectedUser ? (
            <>
              <h3>{selectedUser.name}</h3>
              <dl>
                <div>
                  <dt>ID</dt>
                  <dd>{selectedUser.id}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{selectedUser.email}</dd>
                </div>
                <div>
                  <dt>CPF</dt>
                  <dd>{selectedUser.cpf}</dd>
                </div>
                <div>
                  <dt>Telefone</dt>
                  <dd>{selectedUser.phone}</dd>
                </div>
                <div>
                  <dt>Perfil</dt>
                  <dd>{selectedUser.role === 'ROLE_ADMIN' ? 'Admin' : 'Cliente'}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="muted-message">Selecione um usuario para verificar os dados.</p>
          )}
        </aside>
      </div>
    </section>
  );
}

export default AdminUsersPage;
