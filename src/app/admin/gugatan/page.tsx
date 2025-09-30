import DataTable from "@/components/ui/DataTable";

type Gugatan = {
    no: number;
    kode: string;
    pembayaran: string;
    pendaftaran: string;
    jumlah: string;
    perkara: string;
};

const data: Gugatan[] = [
    { no: 1, kode: "Lorem Ipsum", pembayaran: "Lorem Ipsum", pendaftaran: "Lorem Ipsum", jumlah: "000000", perkara: "00000 & 00000" },
    { no: 2, kode: "Lorem Ipsum", pembayaran: "Lorem Ipsum", pendaftaran: "Lorem Ipsum", jumlah: "000000", perkara: "00000 & 00000" },
    { no: 3, kode: "Lorem Ipsum", pembayaran: "Lorem Ipsum", pendaftaran: "Lorem Ipsum", jumlah: "000000", perkara: "00000 & 00000" },
    { no: 4, kode: "Lorem Ipsum", pembayaran: "Lorem Ipsum", pendaftaran: "Lorem Ipsum", jumlah: "000000", perkara: "00000 & 00000" },
    { no: 5, kode: "Lorem Ipsum", pembayaran: "Lorem Ipsum", pendaftaran: "Lorem Ipsum", jumlah: "000000", perkara: "00000 & 00000" },
    
];

export default function GugatanPage() {
    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Daftar Gugatan</h1>
            <DataTable
                data={data}
                
                columns={[
                    { header: "No", accessor: "no" },
                    { header: "Kode & Tanggal Register", accessor: "kode" },
                    { header: "Status Pembayaran", accessor: "pembayaran" },
                    { header: "Status Pendaftaran", accessor: "pendaftaran" },
                    { header: "Jumlah Panjar Perkara", accessor: "jumlah" },
                    { header: "Nomor Perkara & Tanggal Pendaftaran", accessor: "perkara" },
                ]}
            />
        </div>
    );
}
