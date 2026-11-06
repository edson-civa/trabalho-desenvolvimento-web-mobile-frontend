'use client';

export default function ApiState({ loading = false, message, onRetry }: { loading?: boolean; message: string; onRetry?: () => void }) {
    return (
        <div className="p-4 p-md-5 rounded-4 bg-body-tertiary border border-body-subtle text-center my-4" role={loading ? 'status' : 'alert'}>
            <p className="text-body-secondary mb-0">{message}</p>
            {onRetry && <button type="button" onClick={onRetry} className="btn text-white rounded-3 px-4 mt-3" style={{ backgroundColor: '#7C3AED' }}>Tentar novamente</button>}
        </div>
    );
}
