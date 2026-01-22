const Loading = ({ label = 'Cargando...' }: { label?: string }) => (
  <div aria-busy="true">
    <p>{label}</p>
  </div>
);

export default Loading;
