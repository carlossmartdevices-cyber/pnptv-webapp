import React from 'react';
import { Link } from 'react-router-dom';

export const NotAuthorized = () => (
  <div>
    <h2>No autorizado</h2>
    <p>Tu rol actual no permite esta acción.</p>
    <Link to="/home">Volver</Link>
  </div>
);
