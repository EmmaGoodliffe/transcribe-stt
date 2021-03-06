<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [transcribe-stt](./transcribe-stt.md) &gt; [DistributedSTTStream](./transcribe-stt.distributedsttstream.md) &gt; [(constructor)](./transcribe-stt.distributedsttstream._constructor_.md)

## DistributedSTTStream.(constructor)

Constructs a new instance of the `DistributedSTTStream` class

<b>Signature:</b>

```typescript
constructor(audioFilename: string, audioDirname: string, textFilename: string | null, options: STTStreamOptions);
```

## Parameters

| Parameter     | Type                                                     | Description                                |
| ------------- | -------------------------------------------------------- | ------------------------------------------ |
| audioFilename | string                                                   | Path to audio file                         |
| audioDirname  | string                                                   | Path to output distributed audio directory |
| textFilename  | string \| null                                           | Path to text file or null                  |
| options       | [STTStreamOptions](./transcribe-stt.sttstreamoptions.md) | Options                                    |
